/**
 * WhatsApp Client for sending birthday messages
 * Uses whatsapp-web.js for WhatsApp Web protocol access
 */

import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import type { DeliveryResult } from '../models/types.js';
import { logger } from '../utils/logger.js';

/**
 * WhatsApp client that manages connection, authentication, and message delivery
 * 
 * Features:
 * - QR code authentication on first run
 * - Session persistence in .wwebjs_auth/ directory
 * - Connection status monitoring
 * - Retry logic for message delivery
 */
export class WhatsAppClient {
  private client: Client | null = null;
  private isInitialized = false;
  private isConnected = false;

  /**
   * Initialize the WhatsApp client with QR code authentication
   * 
   * Requirements: 6.3, 6.4, 6.5
   * 
   * @throws Error if authentication fails
   */
  async initialize(): Promise<void> {
    try {
      logger.info('WhatsAppClient', 'Initializing WhatsApp client...');

      // Create client with local authentication strategy
      // Session data will be stored in .wwebjs_auth/ directory
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: '.wwebjs_auth'
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      // Set up event handlers
      this.setupEventHandlers();

      // Initialize the client
      await this.client.initialize();

      this.isInitialized = true;
      logger.info('WhatsAppClient', 'Successfully initialized');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.critical('WhatsAppClient', 'Authentication failed', { error: errorMessage });
      
      throw new Error(`WhatsApp authentication failed: ${errorMessage}`);
    }
  }

  /**
   * Set up event handlers for WhatsApp client
   * Handles QR code display, authentication, and connection monitoring
   * 
   * Requirements: 6.3, 6.4, 6.5
   */
  private setupEventHandlers(): void {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    // Display QR code for authentication on first run
    this.client.on('qr', (qr: string) => {
      logger.info('WhatsAppClient', 'QR Code received. Please scan with your phone:');
      qrcode.generate(qr, { small: true });
    });

    // Handle successful authentication
    this.client.on('authenticated', () => {
      logger.info('WhatsAppClient', 'Authentication successful');
    });

    // Handle authentication failure
    this.client.on('auth_failure', (message: string) => {
      logger.error('WhatsAppClient', 'Authentication failure', { message });
      this.isConnected = false;
    });

    // Handle successful connection
    this.client.on('ready', () => {
      logger.info('WhatsAppClient', 'Client is ready and connected');
      this.isConnected = true;
    });

    // Handle disconnection
    this.client.on('disconnected', (reason: string) => {
      logger.info('WhatsAppClient', 'Client disconnected', { reason });
      this.isConnected = false;
    });

    // Handle loading screen
    this.client.on('loading_screen', (percent: number) => {
      logger.info('WhatsAppClient', `Loading... ${percent}%`);
    });
  }

  /**
   * Send a WhatsApp message with retry logic
   * 
   * Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.4
   * 
   * @param number - WhatsApp number in E.164 format
   * @param message - Message content to send
   * @returns DeliveryResult with success status and details
   */
  async sendMessage(number: string, message: string): Promise<DeliveryResult> {
    const maxAttempts = 3;
    const retryDelayMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Check if client is ready
        if (!await this.isReady()) {
          throw new Error('WhatsApp client is not ready');
        }

        if (!this.client) {
          throw new Error('WhatsApp client is not initialized');
        }

        logger.info('WhatsAppClient', `Sending message to ${number} (attempt ${attempt}/${maxAttempts})`);

        // Format number for WhatsApp (remove + and add @c.us)
        const chatId = number.replace('+', '') + '@c.us';
        
        // Send the message
        const sentMessage = await this.client.sendMessage(chatId, message);

        // Success!
        const result: DeliveryResult = {
          success: true,
          messageId: sentMessage.id.id,
          timestamp: new Date()
        };

        logger.info('WhatsAppClient', `Successfully sent message to ${number}`, {
          messageId: sentMessage.id.id,
          recipient: number
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Log the error
        logger.error('WhatsAppClient', `Failed to send message to ${number} (attempt ${attempt}/${maxAttempts})`, {
          recipient: number,
          attempt,
          maxAttempts,
          error: errorMessage
        });

        // If this was the last attempt, notify user and return failure
        if (attempt === maxAttempts) {
          const failureResult: DeliveryResult = {
            success: false,
            timestamp: new Date(),
            error: errorMessage
          };

          // Send critical error notification
          this.notifyUser(
            'WhatsApp Message Delivery Failed',
            `Failed to send message to ${number} after ${maxAttempts} attempts. Error: ${errorMessage}`
          );

          return failureResult;
        }

        // Wait before retrying (except on last attempt)
        logger.info('WhatsAppClient', `Retrying in ${retryDelayMs / 1000} seconds...`);
        await this.sleep(retryDelayMs);
      }
    }

    // This should never be reached, but TypeScript needs it
    return {
      success: false,
      timestamp: new Date(),
      error: 'Unknown error: max attempts reached'
    };
  }

  /**
   * Check if the client is ready to send messages
   * 
   * @returns true if client is initialized and connected
   */
  async isReady(): Promise<boolean> {
    return this.isInitialized && this.isConnected && this.client !== null;
  }

  /**
   * Disconnect the WhatsApp client
   * 
   * @throws Error if disconnection fails
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        logger.info('WhatsAppClient', 'Disconnecting...');
        await this.client.destroy();
        this.isConnected = false;
        this.isInitialized = false;
        this.client = null;
        logger.info('WhatsAppClient', 'Successfully disconnected');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('WhatsAppClient', 'Disconnection failed', { error: errorMessage });
      
      throw new Error(`WhatsApp disconnection failed: ${errorMessage}`);
    }
  }

  /**
   * Sleep for a specified duration
   * 
   * @param ms - Duration in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Notify user of critical errors
   * 
   * Requirements: 7.4
   * 
   * @param title - Notification title
   * @param message - Notification message
   */
  private notifyUser(title: string, message: string): void {
    logger.critical('WhatsAppClient', title, { message });

    // TODO: Implement email/webhook notification if configured
  }
}
