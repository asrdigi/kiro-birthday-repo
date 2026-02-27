/**
 * Railway Cloud Application Entry Point
 * Optimized for cloud deployment with health checks and graceful shutdown
 */

import { createServer } from 'http';
import { 
  initializeDatabase, 
  closeDatabase,
  StateManager,
  GoogleSheetsClient,
  DataLoader,
  MessageGenerator
} from './services';
import { TwilioWhatsAppClient as WhatsAppClient } from './services/TwilioWhatsAppClient';
import { Scheduler } from './services/Scheduler';
import { logger } from './utils/logger';

class RailwayApp {
  private server: any;
  private scheduler: Scheduler | null = null;
  private whatsappClient: WhatsAppClient | null = null;
  private isShuttingDown = false;

  async start() {
    try {
      logger.info('RailwayApp', 'Starting Birthday WhatsApp Messenger on Railway');
      
      // Validate environment variables
      this.validateEnvironmentVariables();
      
      // Initialize database
      const dbPath = process.env.DATABASE_PATH || '/app/data/birthday_messenger.db';
      logger.info('RailwayApp', `Initializing database at: ${dbPath}`);
      initializeDatabase(dbPath);

      // Create HTTP server for Railway health checks
      this.createHealthCheckServer();

      // Initialize all services
      await this.initializeServices();

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      logger.info('RailwayApp', 'Application started successfully on Railway');
      logger.info('RailwayApp', `Health check server running on port ${process.env.PORT || 3000}`);
      logger.info('RailwayApp', `Scheduler timezone: ${process.env.SCHEDULER_TIMEZONE || 'Asia/Kolkata'}`);
      logger.info('RailwayApp', `Cron schedule: ${process.env.CRON_SCHEDULE || '0 4 * * *'}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('RailwayApp', 'Failed to start application', { error: errorMessage });
      process.exit(1);
    }
  }

  private validateEnvironmentVariables(): void {
    const requiredVars = [
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
      'GOOGLE_SHEET_ID',
      'OPENAI_API_KEY',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_WHATSAPP_FROM'
    ];

    const missingVars: string[] = [];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
        `Please configure these in Railway's environment variables.`
      );
    }

    logger.info('RailwayApp', 'All required environment variables validated');
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize StateManager
      logger.info('RailwayApp', 'Initializing StateManager...');
      const stateManager = new StateManager();

      // Initialize GoogleSheetsClient
      logger.info('RailwayApp', 'Initializing GoogleSheetsClient...');
      const googleSheetsClient = new GoogleSheetsClient();
      await googleSheetsClient.authenticate();

      // Initialize DataLoader
      logger.info('RailwayApp', 'Initializing DataLoader...');
      const dataLoader = new DataLoader(googleSheetsClient);

      // Initialize MessageGenerator
      logger.info('RailwayApp', 'Initializing MessageGenerator...');
      const messageGenerator = new MessageGenerator();
      await messageGenerator.initialize();

      // Initialize WhatsAppClient
      logger.info('RailwayApp', 'Initializing WhatsAppClient...');
      this.whatsappClient = new WhatsAppClient();
      await this.whatsappClient.initialize();

      // Initialize Scheduler
      logger.info('RailwayApp', 'Initializing Scheduler...');
      this.scheduler = new Scheduler(
        dataLoader,
        messageGenerator,
        this.whatsappClient,
        stateManager
      );

      // Start Scheduler
      logger.info('RailwayApp', 'Starting Scheduler...');
      await this.scheduler.start();

      logger.info('RailwayApp', 'All services initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('RailwayApp', 'Failed to initialize services', { error: errorMessage });
      throw error;
    }
  }

  private createHealthCheckServer() {
    const port = process.env.PORT || 3000;
    
    this.server = createServer((req, res) => {
      if (req.url === '/health' || req.url === '/') {
        // Health check endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          service: 'Birthday WhatsApp Messenger',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          scheduler: this.scheduler ? 'running' : 'stopped',
          environment: process.env.NODE_ENV || 'development'
        }));
      } else if (req.url === '/status') {
        // Detailed status endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          service: 'Birthday WhatsApp Messenger',
          version: '1.0.0',
          status: 'running',
          scheduler: {
            running: this.scheduler ? true : false,
            timezone: process.env.SCHEDULER_TIMEZONE || 'Asia/Kolkata',
            schedule: process.env.CRON_SCHEDULE || '0 4 * * *'
          },
          database: {
            path: process.env.DATABASE_PATH || '/app/data/birthday_messenger.db'
          },
          whatsapp: {
            testMode: process.env.WHATSAPP_TEST_MODE === 'true',
            initialized: this.whatsappClient ? true : false
          },
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }));
      } else {
        // 404 for other routes
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    this.server.listen(port, () => {
      logger.info('RailwayApp', `Health check server listening on port ${port}`);
    });
  }

  private setupGracefulShutdown() {
    const shutdown = async (signal: string) => {
      if (this.isShuttingDown) {
        logger.info('RailwayApp', 'Shutdown already in progress');
        return;
      }

      this.isShuttingDown = true;
      logger.info('RailwayApp', `Received ${signal}, starting graceful shutdown`);

      try {
        // Stop scheduler
        if (this.scheduler) {
          logger.info('RailwayApp', 'Stopping scheduler');
          this.scheduler.stop();
        }

        // Disconnect WhatsApp client
        if (this.whatsappClient) {
          logger.info('RailwayApp', 'Disconnecting WhatsApp client');
          await this.whatsappClient.disconnect();
        }

        // Close database
        logger.info('RailwayApp', 'Closing database connection');
        closeDatabase();

        // Close HTTP server
        if (this.server) {
          logger.info('RailwayApp', 'Closing health check server');
          this.server.close();
        }

        logger.info('RailwayApp', 'Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('RailwayApp', 'Error during shutdown', { error: errorMessage });
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('RailwayApp', 'Uncaught exception', { error: error.message, stack: error.stack });
      shutdown('UNCAUGHT_EXCEPTION');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('RailwayApp', 'Unhandled rejection', { reason, promise });
      shutdown('UNHANDLED_REJECTION');
    });
  }
}

// Start the Railway application
const app = new RailwayApp();
app.start().catch((error) => {
  console.error('Failed to start Railway app:', error);
  process.exit(1);
});