/**
 * Main entry point for the Birthday WhatsApp Messenger
 * 
 * Initializes all services in the correct order:
 * 1. Load environment variables
 * 2. Validate required environment variables
 * 3. Initialize database (StateManager)
 * 4. Initialize GoogleSheetsClient
 * 5. Initialize DataLoader
 * 6. Initialize MessageGenerator
 * 7. Initialize WhatsAppClient
 * 8. Initialize Scheduler
 * 9. Start Scheduler
 * 
 * Requirements: 6.4, 8.1, 8.3
 */

import dotenv from 'dotenv';
import { logger } from './utils/logger';
import {
  initializeDatabase,
  closeDatabase,
  StateManager,
  GoogleSheetsClient,
  DataLoader,
  MessageGenerator,
  WhatsAppClient
} from './services';
import { Scheduler } from './services/Scheduler';

// Load environment variables
dotenv.config();

/**
 * Validates that all required environment variables are set
 * 
 * Requirements: 6.4
 * 
 * @throws Error if any required environment variable is missing
 */
function validateEnvironmentVariables(): void {
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'GOOGLE_SHEET_ID',
    'OPENAI_API_KEY'
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
      `Please check your .env file and ensure all required variables are set.`
    );
  }

  logger.info('Main', 'All required environment variables validated');
}

/**
 * Main application entry point
 * 
 * Initializes all services and starts the scheduler
 * 
 * Requirements: 6.4, 8.1, 8.3
 */
async function main() {
  logger.info('Main', 'Birthday WhatsApp Messenger starting...');

  try {
    // Step 1: Validate required environment variables
    logger.info('Main', 'Validating environment variables...');
    validateEnvironmentVariables();

    // Step 2: Initialize database
    logger.info('Main', 'Initializing database...');
    const dbPath = process.env.DATABASE_PATH || './data/birthday_messenger.db';
    initializeDatabase(dbPath);
    logger.info('Main', 'Database initialized successfully');

    // Step 3: Initialize StateManager
    logger.info('Main', 'Initializing StateManager...');
    const stateManager = new StateManager();
    logger.info('Main', 'StateManager initialized successfully');

    // Step 4: Initialize GoogleSheetsClient
    logger.info('Main', 'Initializing GoogleSheetsClient...');
    const googleSheetsClient = new GoogleSheetsClient();
    await googleSheetsClient.authenticate();
    logger.info('Main', 'GoogleSheetsClient initialized successfully');

    // Step 5: Initialize DataLoader
    logger.info('Main', 'Initializing DataLoader...');
    const dataLoader = new DataLoader(googleSheetsClient);
    logger.info('Main', 'DataLoader initialized successfully');

    // Step 6: Initialize MessageGenerator
    logger.info('Main', 'Initializing MessageGenerator...');
    const messageGenerator = new MessageGenerator();
    await messageGenerator.initialize();
    logger.info('Main', 'MessageGenerator initialized successfully');

    // Step 7: Initialize WhatsAppClient
    logger.info('Main', 'Initializing WhatsAppClient...');
    const whatsappClient = new WhatsAppClient();
    await whatsappClient.initialize();
    logger.info('Main', 'WhatsAppClient initialized successfully');

    // Step 8: Initialize Scheduler
    logger.info('Main', 'Initializing Scheduler...');
    const scheduler = new Scheduler(
      dataLoader,
      messageGenerator,
      whatsappClient,
      stateManager
    );
    logger.info('Main', 'Scheduler initialized successfully');

    // Step 9: Start Scheduler
    logger.info('Main', 'Starting Scheduler...');
    await scheduler.start();
    logger.info('Main', 'Scheduler started successfully');

    logger.info('Main', 'Birthday WhatsApp Messenger is now running. Daily execution scheduled at 4:00 AM IST.');

    // Set up graceful shutdown handling
    setupGracefulShutdown(scheduler, whatsappClient);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.critical('Main', 'Failed to start application', { error: errorMessage });
    throw error;
  }
}

/**
 * Sets up graceful shutdown handlers for SIGINT and SIGTERM
 * 
 * Ensures proper cleanup of resources when the application is terminated:
 * - Stops the scheduler
 * - Disconnects WhatsApp client
 * - Closes database connection
 * 
 * Requirements: 8.1
 * 
 * @param scheduler - Scheduler instance to stop
 * @param whatsappClient - WhatsApp client to disconnect
 */
function setupGracefulShutdown(scheduler: Scheduler, whatsappClient: WhatsAppClient): void {
  const shutdown = async (signal: string) => {
    logger.info('Main', `Received ${signal} signal. Starting graceful shutdown...`);

    try {
      // Stop the scheduler
      logger.info('Main', 'Stopping scheduler...');
      scheduler.stop();

      // Disconnect WhatsApp client
      logger.info('Main', 'Disconnecting WhatsApp client...');
      await whatsappClient.disconnect();

      // Close database connection
      logger.info('Main', 'Closing database connection...');
      closeDatabase();

      logger.info('Main', 'Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Main', 'Error during graceful shutdown', { error: errorMessage });
      process.exit(1);
    }
  };

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle SIGTERM (kill command)
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Start the application
main().catch((error) => {
  logger.critical('Main', 'Fatal error occurred', { error: error.message || String(error) });
  process.exit(1);
});
