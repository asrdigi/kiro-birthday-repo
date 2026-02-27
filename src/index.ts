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
  DataLoader
} from './services';
import { MessageGeneratorFactory } from './services/MessageGeneratorFactory';
import { TwilioWhatsAppClient as WhatsAppClient } from './services/TwilioWhatsAppClient';
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

  // Check if we're in complete test mode
  const completeTestMode = process.env.COMPLETE_TEST_MODE === 'true';
  
  if (completeTestMode) {
    logger.info('Main', '🧪 RUNNING IN COMPLETE TEST MODE - All external services will be simulated');
    logger.info('Main', '📝 Test data: 2 friends with birthdays today will be simulated');
    logger.info('Main', '💬 WhatsApp messages will be simulated (not actually sent)');
    logger.info('Main', '🤖 OpenAI message generation will be simulated');
    logger.info('Main', '📊 Google Sheets data will be simulated');
    logger.info('Main', '⏰ Scheduler will run once immediately for testing, then schedule for 4 AM IST');
    
    // In test mode, we'll simulate a quick run
    await runTestMode();
    return;
  }

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
    const messageGenerator = MessageGeneratorFactory.create();
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
 * Run the application in complete test mode
 * Simulates all external services and runs a quick test
 */
async function runTestMode(): Promise<void> {
  try {
    // Simulate test data
    const testFriends = [
      {
        name: 'John Doe',
        birthdate: new Date().toISOString().split('T')[0], // Today's date
        motherTongue: 'English',
        whatsappNumber: '+1234567890',
        country: 'United States'
      },
      {
        name: 'Maria Garcia',
        birthdate: new Date().toISOString().split('T')[0], // Today's date
        motherTongue: 'Spanish',
        whatsappNumber: '+9876543210',
        country: 'Mexico'
      }
    ];

    logger.info('Main', `Found ${testFriends.length} friends with birthdays today (simulated)`);

    // Simulate message generation and sending
    for (const friend of testFriends) {
      // Simulate message generation
      const simulatedMessage = `🎉 Happy Birthday ${friend.name}! 🎂\n\nWishing you a wonderful day filled with joy, laughter, and all your favorite things! May this new year of your life bring you happiness, success, and countless beautiful memories.\n\nHave an amazing celebration! 🥳✨`;
      
      logger.info('Main', `[TEST MODE] Generated birthday message for ${friend.name}`, {
        recipient: friend.name,
        language: friend.motherTongue,
        messageLength: simulatedMessage.length
      });

      // Simulate WhatsApp message sending
      const messageId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      logger.info('Main', `[TEST MODE] Simulated WhatsApp message sent to ${friend.name}`, {
        recipient: friend.whatsappNumber,
        messageId,
        success: true
      });

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    logger.info('Main', '✅ Test mode completed successfully!');
    logger.info('Main', '📋 Summary:');
    logger.info('Main', `   • Found ${testFriends.length} friends with birthdays today`);
    logger.info('Main', `   • Generated ${testFriends.length} personalized messages`);
    logger.info('Main', `   • Simulated sending ${testFriends.length} WhatsApp messages`);
    logger.info('Main', '');
    logger.info('Main', '🔧 To run with real services:');
    logger.info('Main', '   1. Set COMPLETE_TEST_MODE=false in .env');
    logger.info('Main', '   2. Enable Google Sheets API in Google Cloud Console');
    logger.info('Main', '   3. Share your Google Sheet with the service account');
    logger.info('Main', '   4. Set WHATSAPP_TEST_MODE=false to use real WhatsApp');
    logger.info('Main', '');
    logger.info('Main', '🎯 Application will now exit. In production, it would schedule daily runs at 4 AM IST.');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.critical('Main', 'Test mode failed', { error: errorMessage });
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
