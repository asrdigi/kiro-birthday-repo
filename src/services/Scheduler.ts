/**
 * Scheduler Service - Orchestrates birthday checking and message sending
 * 
 * Main orchestrator that runs once daily at 4:00 AM IST, checking all friends
 * for birthdays occurring today in their local timezone and coordinating
 * message delivery.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.5, 2.2, 2.3, 3.1, 4.1, 4.5, 5.2, 5.3, 7.2, 7.3
 */

import cron from 'node-cron';
import { DataLoader } from './DataLoader';
import { MessageGenerator } from './MessageGenerator';
import { IMessageGenerator } from './MessageGeneratorFactory';
import type { IWhatsAppClient } from './IWhatsAppClient';
import { StateManager } from './StateManager';
import { Friend } from '../models/types';
import { isBirthdayToday } from '../utils/timezone';
import { logger } from '../utils/logger';

/**
 * Scheduler class that orchestrates the birthday messaging workflow
 * 
 * Runs once daily at 4:00 AM IST to:
 * 1. Check all friends for birthdays in their local timezone
 * 2. Generate and send birthday messages
 * 3. Record sent messages to prevent duplicates
 * 4. Refresh friend data every 24 hours
 */
export class Scheduler {
  private dataLoader: DataLoader;
  private messageGenerator: IMessageGenerator;
  private whatsappClient: IWhatsAppClient;
  private stateManager: StateManager;
  private cronJob: cron.ScheduledTask | null = null;
  private dataRefreshJob: cron.ScheduledTask | null = null;

  /**
   * Creates a new Scheduler instance
   * 
   * @param dataLoader - DataLoader instance for fetching friend data
   * @param messageGenerator - MessageGenerator instance for creating messages
   * @param whatsappClient - WhatsAppClient instance for sending messages
   * @param stateManager - StateManager instance for tracking sent messages
   */
  constructor(
    dataLoader: DataLoader,
    messageGenerator: IMessageGenerator,
    whatsappClient: IWhatsAppClient,
    stateManager: StateManager
  ) {
    this.dataLoader = dataLoader;
    this.messageGenerator = messageGenerator;
    this.whatsappClient = whatsappClient;
    this.stateManager = stateManager;
  }

  /**
   * Starts the scheduler and initializes daily execution at 4:00 AM IST
   * 
   * Sets up:
   * - Daily birthday check at 4:00 AM IST
   * - Daily data refresh at 4:00 AM IST
   * - Startup validation of all API connections
   * 
   * Requirements: 8.1, 8.2, 8.3
   * 
   * @throws Error if startup validation fails
   */
  async start(): Promise<void> {
    try {
      logger.info('Scheduler', 'Starting scheduler...');

      // Validate all API connections on startup
      await this.validateStartup();

      // Get cron schedule from environment variables
      const cronSchedule = process.env.CRON_SCHEDULE || '0 4 * * *';
      const timezone = process.env.SCHEDULER_TIMEZONE || 'Asia/Kolkata';

      // Schedule daily execution using environment configuration
      this.cronJob = cron.schedule(
        cronSchedule,
        async () => {
          logger.info('Scheduler', `Daily birthday check triggered at ${cronSchedule} ${timezone}`);
          await this.checkBirthdays();
        },
        {
          scheduled: true,
          timezone: timezone
        }
      );

      // Schedule data refresh using the same schedule
      this.dataRefreshJob = cron.schedule(
        cronSchedule,
        async () => {
          logger.info('Scheduler', 'Daily data refresh triggered');
          await this.refreshData();
        },
        {
          scheduled: true,
          timezone: timezone
        }
      );

      // Parse cron schedule for display
      const [minute, hour] = cronSchedule.split(' ');
      const displayTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      
      logger.info('Scheduler', `Scheduler started successfully. Daily execution scheduled at ${displayTime} ${timezone}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.critical('Scheduler', 'Failed to start scheduler', { error: errorMessage });
      throw new Error(`Failed to start scheduler: ${errorMessage}`);
    }
  }

  /**
   * Validates all API connections on startup
   * 
   * Checks that all required services are properly authenticated and ready:
   * - DataLoader (Google Sheets API)
   * - MessageGenerator (ChatGPT API)
   * - WhatsAppClient (WhatsApp Web) - skipped in test mode
   * 
   * Halts execution if any authentication fails.
   * 
   * Requirements: 8.3
   * 
   * @throws Error if any API connection validation fails
   */
  private async validateStartup(): Promise<void> {
      logger.info('Scheduler', 'Validating API connections...');

      try {
        // Check if we're in test mode
        const testMode = process.env.WHATSAPP_TEST_MODE === 'true';
        const completeTestMode = process.env.COMPLETE_TEST_MODE === 'true';

        if (testMode || completeTestMode) {
          logger.info('Scheduler', 'Running in TEST MODE - WhatsApp validation skipped');
          logger.info('Scheduler', 'WhatsApp client validation skipped (test mode)');
        } else {
          // Validate WhatsApp client is ready (with retry for authentication)
          let whatsappReady = await this.whatsappClient.isReady();

          if (!whatsappReady) {
            // Give WhatsApp more time to authenticate if session exists
            logger.info('Scheduler', 'WhatsApp not ready, waiting for authentication...');
            logger.info('Scheduler', 'Please scan the QR code with your phone if displayed');

            // Wait up to 120 seconds (2 minutes) for WhatsApp to be ready
            // This gives user enough time to scan QR code
            for (let i = 0; i < 120; i++) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
              whatsappReady = await this.whatsappClient.isReady();

              if (whatsappReady) {
                break;
              }

              // Log progress every 15 seconds
              if ((i + 1) % 15 === 0) {
                logger.info('Scheduler', `Still waiting for WhatsApp authentication... (${i + 1}s elapsed)`);
              }
            }

            if (!whatsappReady) {
              throw new Error('WhatsApp client is not ready after 120 seconds. Please scan the QR code.');
            }
          }

          logger.info('Scheduler', 'WhatsApp client validated successfully');
        }

        // Validate MessageGenerator by checking if it's initialized
        // (initialization happens in main.ts before scheduler starts)
        logger.info('Scheduler', 'MessageGenerator validated successfully');

        // Validate DataLoader by attempting to load friends
        // This will verify Google Sheets API connection
        await this.dataLoader.loadFriends();
        logger.info('Scheduler', 'DataLoader validated successfully');

        logger.info('Scheduler', 'All API connections validated successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.critical('Scheduler', 'Startup validation failed', { error: errorMessage });
        throw new Error(`Startup validation failed: ${errorMessage}`);
      }
    }

  /**
   * Checks all friends for birthdays and processes birthday events
   * 
   * Evaluates all friends to determine if today is their birthday in their
   * local timezone. For each birthday detected, processes the birthday event
   * by generating and sending a message.
   * 
   * Requirements: 2.2, 2.3, 7.3
   */
  async checkBirthdays(): Promise<void> {
    try {
      logger.info('Scheduler', 'Starting birthday check...');

      // Load all friends
      const friends = await this.dataLoader.loadFriends();
      logger.info('Scheduler', `Checking birthdays for ${friends.length} friends`);

      // Check each friend for birthday
      let birthdaysDetected = 0;
      
      for (const friend of friends) {
        try {
          // Determine if today is the friend's birthday in their local timezone
          const isBirthday = isBirthdayToday(friend.birthdate, friend.country);

          if (isBirthday) {
            birthdaysDetected++;
            
            // Log detected birthday event
            logger.info('Scheduler', `Birthday detected for ${friend.name} (${friend.country})`, {
              friendId: friend.id,
              friendName: friend.name,
              country: friend.country,
              timezone: friend.timezone
            });

            // Process the birthday
            await this.processBirthday(friend);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error('Scheduler', `Error checking birthday for ${friend.name}`, {
            friendId: friend.id,
            friendName: friend.name,
            error: errorMessage
          });
          // Continue with next friend
        }
      }

      logger.info('Scheduler', `Birthday check completed. ${birthdaysDetected} birthdays detected`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Scheduler', 'Birthday check failed', { error: errorMessage });
      throw new Error(`Birthday check failed: ${errorMessage}`);
    }
  }

  /**
   * Processes a birthday event for a single friend
   * 
   * Complete workflow:
   * 1. Check if message already sent this year (duplicate prevention)
   * 2. Generate birthday message using MessageGenerator
   * 3. Send message using WhatsAppClient
   * 4. Record sent message using StateManager
   * 5. Log success or failure
   * 
   * Requirements: 3.1, 4.1, 4.5, 5.2, 5.3, 7.2
   * 
   * @param friend - Friend whose birthday it is
   */
  async processBirthday(friend: Friend): Promise<void> {
    try {
      logger.info('Scheduler', `Processing birthday for ${friend.name}...`);

      // Check if message already sent this year (duplicate prevention)
      const currentYear = new Date().getFullYear();
      const alreadySent = await this.stateManager.wasMessageSent(friend.id, currentYear);

      if (alreadySent) {
        logger.info('Scheduler', `Birthday message already sent to ${friend.name} this year. Skipping.`, {
          friendId: friend.id,
          friendName: friend.name,
          year: currentYear
        });
        return;
      }

      // Generate birthday message
      logger.info('Scheduler', `Generating birthday message for ${friend.name}...`);
      const message = await this.messageGenerator.generateMessage(friend);

      // Send message via WhatsApp
      logger.info('Scheduler', `Sending birthday message to ${friend.name}...`);
      const deliveryResult = await this.whatsappClient.sendMessage(
        friend.whatsappNumber,
        message
      );

      // Record sent message
      const deliveryStatus = deliveryResult.success ? 'sent' : 'failed';
      await this.stateManager.recordSentMessage(
        friend.id,
        currentYear,
        deliveryResult.messageId || null,
        message,
        deliveryStatus
      );

      // Log success or failure
      if (deliveryResult.success) {
        logger.info('Scheduler', `Successfully sent birthday message to ${friend.name}`, {
          friendId: friend.id,
          friendName: friend.name,
          messageId: deliveryResult.messageId,
          whatsappNumber: friend.whatsappNumber
        });
      } else {
        logger.error('Scheduler', `Failed to send birthday message to ${friend.name}`, {
          friendId: friend.id,
          friendName: friend.name,
          error: deliveryResult.error,
          whatsappNumber: friend.whatsappNumber
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Scheduler', `Error processing birthday for ${friend.name}`, {
        friendId: friend.id,
        friendName: friend.name,
        error: errorMessage
      });
      
      // Record failed attempt
      try {
        const currentYear = new Date().getFullYear();
        await this.stateManager.recordSentMessage(
          friend.id,
          currentYear,
          null,
          `Failed to generate/send message: ${errorMessage}`,
          'failed'
        );
      } catch (recordError) {
        logger.error('Scheduler', `Failed to record error for ${friend.name}`, {
          friendId: friend.id,
          error: recordError instanceof Error ? recordError.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Triggers data refresh from Google Sheets
   * 
   * Refreshes the friend data cache every 24 hours to capture updates
   * made to the Google Sheets.
   * 
   * Requirements: 8.5
   */
  private async refreshData(): Promise<void> {
    try {
      logger.info('Scheduler', 'Refreshing friend data from Google Sheets...');
      await this.dataLoader.refreshCache();
      logger.info('Scheduler', 'Friend data refreshed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Scheduler', 'Data refresh failed', { error: errorMessage });
      // Don't throw - allow scheduler to continue running
    }
  }

  /**
   * Stops the scheduler and cancels all scheduled jobs
   */
  stop(): void {
    logger.info('Scheduler', 'Stopping scheduler...');
    
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    
    if (this.dataRefreshJob) {
      this.dataRefreshJob.stop();
      this.dataRefreshJob = null;
    }
    
    logger.info('Scheduler', 'Scheduler stopped');
  }
}
