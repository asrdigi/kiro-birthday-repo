/**
 * Twilio WhatsApp Client for sending birthday messages
 * Uses Twilio WhatsApp API for cloud-based message delivery
 * 
 * This client replaces whatsapp-web.js with Twilio API, enabling:
 * - Zero QR code authentication (uses API credentials)
 * - Fully autonomous cloud deployment on Railway
 * - No local browser sessions or display requirements
 * - Comprehensive error handling and retry logic
 */

import Twilio from 'twilio';
import type { DeliveryResult } from '../models/types';
import type { IWhatsAppClient } from './IWhatsAppClient';
import { logger } from '../utils/logger';

/**
 * Enhanced DeliveryResult with Twilio-specific fields
 */
interface TwilioDeliveryResult extends DeliveryResult {
  twilioStatus?: string;
  errorCode?: string;
  priceUnit?: string;
  price?: string;
}

/**
 * Twilio configuration interface
 */
interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  sandboxMode: boolean;
  testMode: boolean;
}

/**
 * Twilio WhatsApp client that manages API authentication and message delivery
 * 
 * Features:
 * - API-based authentication (no QR codes)
 * - Retry logic with exponential backoff
 * - Phone number validation (E.164 format)
 * - Comprehensive error handling
 * - Test mode simulation
 * - Sandbox testing support
 */
export class TwilioWhatsAppClient implements IWhatsAppClient {
  private twilioClient: Twilio.Twilio | null = null;
  private isInitialized = false;
  private fromNumber = '';
  private config: TwilioConfig | null = null;

  /**
   * Initialize the Twilio WhatsApp client with API credentials
   * 
   * Requirements: 2.5, 5.1, 5.2, 5.3, 5.4, 5.6, 5.7
   * 
   * @throws Error if credentials are missing or invalid
   */
  async initialize(): Promise<void> {
    try {
      logger.info('TwilioWhatsAppClient', 'Initializing Twilio WhatsApp client...');

      // Check if we're in test mode
      const testMode = process.env.WHATSAPP_TEST_MODE === 'true';
      
      if (testMode) {
        logger.info('TwilioWhatsAppClient', 'Running in TEST MODE - WhatsApp messages will be simulated');
        this.isInitialized = true;
        this.config = {
          accountSid: 'TEST_ACCOUNT_SID',
          authToken: 'TEST_AUTH_TOKEN',
          fromNumber: 'whatsapp:+14155238886',
          sandboxMode: false,
          testMode: true
        };
        return;
      }

      // Validate and load configuration
      this.config = this.loadConfig();
      this.validateConfig(this.config);

      // Create Twilio client
      this.twilioClient = Twilio(this.config.accountSid, this.config.authToken);
      this.fromNumber = this.config.fromNumber;

      this.isInitialized = true;
      logger.info('TwilioWhatsAppClient', 'Successfully initialized', {
        sandboxMode: this.config.sandboxMode,
        fromNumber: this.redactPhoneNumber(this.fromNumber)
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.critical('TwilioWhatsAppClient', 'Initialization failed', { error: errorMessage });
      
      throw new Error(`Twilio WhatsApp initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Load Twilio configuration from environment variables
   * 
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
   * 
   * @returns TwilioConfig object
   * @throws Error if required variables are missing
   */
  private loadConfig(): TwilioConfig {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const sandboxMode = process.env.TWILIO_SANDBOX_MODE === 'true';
    const testMode = process.env.WHATSAPP_TEST_MODE === 'true';

    // Check for missing required variables
    const missing: string[] = [];
    if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
    if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
    if (!fromNumber) missing.push('TWILIO_WHATSAPP_FROM');

    if (missing.length > 0) {
      throw new Error(
        `Missing required Twilio environment variables: ${missing.join(', ')}. ` +
        `Please configure these in your .env file or Railway environment variables.`
      );
    }

    return {
      accountSid: accountSid!,
      authToken: authToken!,
      fromNumber: fromNumber!,
      sandboxMode,
      testMode
    };
  }

  /**
   * Validate Twilio configuration format
   * 
   * Requirements: 5.6, 5.7
   * 
   * @param config - TwilioConfig to validate
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: TwilioConfig): void {
    // Validate Account SID format
    if (!config.accountSid.startsWith('AC')) {
      throw new Error(
        'TWILIO_ACCOUNT_SID must start with "AC". ' +
        'Please check your Twilio Console for the correct Account SID.'
      );
    }

    // Validate from number format
    if (!config.fromNumber.startsWith('whatsapp:+')) {
      throw new Error(
        'TWILIO_WHATSAPP_FROM must be in format: whatsapp:+1234567890. ' +
        'Example: whatsapp:+14155238886 (Twilio sandbox number)'
      );
    }

    // Validate auth token is not empty
    if (config.authToken.length < 10) {
      throw new Error(
        'TWILIO_AUTH_TOKEN appears to be invalid (too short). ' +
        'Please check your Twilio Console for the correct Auth Token.'
      );
    }
  }

  /**
   * Send a WhatsApp message via Twilio API with retry logic
   * 
   * Requirements: 2.2, 2.3, 2.4, 12.4
   * 
   * @param number - WhatsApp number in E.164 format (+1234567890)
   * @param message - Message content to send
   * @returns DeliveryResult with success status and details
   */
  async sendMessage(number: string, message: string): Promise<DeliveryResult> {
    try {
      // Validate phone number format first (even in test mode)
      if (!this.validatePhoneNumber(number)) {
        const errorResult: DeliveryResult = {
          success: false,
          timestamp: new Date(),
          error: `Invalid phone number format: ${number}. Must be E.164 format (e.g., +919876543210)`
        };
        
        logger.error('TwilioWhatsAppClient', 'Phone number validation failed', {
          recipient: number,
          error: errorResult.error
        });
        
        return errorResult;
      }

      // Check if we're in test mode
      if (this.config?.testMode) {
        return this.simulateMessageSending(number, message);
      }

      // Send with retry logic
      return await this.sendWithRetry(number, message, 3);
      
    } catch (error) {
      // Catch-all for unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('TwilioWhatsAppClient', 'Unexpected error sending message', {
        recipient: number,
        error: errorMessage
      });
      
      return {
        success: false,
        timestamp: new Date(),
        error: errorMessage
      };
    }
  }

  /**
   * Send message with retry logic and exponential backoff
   * 
   * Requirements: 3.6, 9.2, 9.5, 9.6
   * 
   * @param number - WhatsApp number in E.164 format
   * @param message - Message content
   * @param maxAttempts - Maximum number of retry attempts
   * @returns DeliveryResult with status and details
   */
  private async sendWithRetry(
    number: string,
    message: string,
    maxAttempts: number
  ): Promise<TwilioDeliveryResult> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (!this.twilioClient) {
          throw new Error('Twilio client is not initialized');
        }

        logger.info('TwilioWhatsAppClient', `Sending message to ${number} (attempt ${attempt}/${maxAttempts})`);

        // Format numbers for Twilio
        const to = `whatsapp:${number}`;
        const from = this.fromNumber;

        // Send message via Twilio API
        const result = await this.twilioClient.messages.create({
          from,
          to,
          body: message
        });

        // Success!
        const deliveryResult: TwilioDeliveryResult = {
          success: true,
          messageId: result.sid,
          timestamp: new Date(),
          twilioStatus: result.status,
          price: result.price || undefined,
          priceUnit: result.priceUnit || undefined
        };

        logger.info('TwilioWhatsAppClient', `Successfully sent message to ${number}`, {
          messageId: result.sid,
          recipient: number,
          status: result.status,
          price: result.price,
          priceUnit: result.priceUnit
        });

        return deliveryResult;
        
      } catch (error) {
        lastError = error as Error;
        const errorCode = (error as any).code || 'UNKNOWN';
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        logger.error('TwilioWhatsAppClient', `Failed to send message (attempt ${attempt}/${maxAttempts})`, {
          recipient: number,
          attempt,
          maxAttempts,
          errorCode,
          error: errorMessage
        });
        
        // Check if error is retryable
        if (this.isRetryableError(errorCode)) {
          if (attempt < maxAttempts) {
            // Calculate exponential backoff delay: 1s, 2s, 4s
            const delayMs = Math.pow(2, attempt - 1) * 1000;
            
            logger.info('TwilioWhatsAppClient', 
              `Retrying after ${delayMs}ms (attempt ${attempt}/${maxAttempts})`,
              { recipient: number, errorCode, delayMs }
            );
            
            await this.sleep(delayMs);
            continue;
          }
        } else {
          // Non-retryable error, fail immediately
          logger.error('TwilioWhatsAppClient', 'Non-retryable error encountered', {
            recipient: number,
            errorCode,
            error: errorMessage
          });
          break;
        }
      }
    }
    
    // All retries failed
    const errorCode = (lastError as any)?.code || 'UNKNOWN';
    const errorMessage = lastError?.message || 'Unknown error';
    
    logger.error('TwilioWhatsAppClient', 'All retry attempts failed', {
      recipient: number,
      maxAttempts,
      finalError: errorMessage,
      errorCode
    });
    
    return {
      success: false,
      timestamp: new Date(),
      error: errorMessage,
      errorCode
    };
  }

  /**
   * Check if an error code is retryable
   * 
   * Requirements: 9.1, 9.2, 9.3, 9.4
   * 
   * @param errorCode - Twilio or network error code
   * @returns true if error is retryable
   */
  private isRetryableError(errorCode: string): boolean {
    const retryableCodes = [
      '20429',       // Rate limit exceeded
      '20500',       // Internal server error
      '20503',       // Service unavailable
      'ECONNRESET',  // Network error
      'ETIMEDOUT',   // Timeout
      'ENOTFOUND',   // DNS error
      'ENETUNREACH', // Network unreachable
      'EHOSTUNREACH' // Host unreachable
    ];
    
    return retryableCodes.includes(errorCode);
  }

  /**
   * Validate phone number format (E.164)
   * 
   * Requirements: 12.1, 12.2, 12.3
   * 
   * @param number - Phone number to validate
   * @returns true if valid E.164 format
   */
  private validatePhoneNumber(number: string): boolean {
    // E.164 format: +[country code][number]
    // Must start with +, followed by 1-3 digit country code, then 4-14 digits
    // Total length: 7-15 characters (including +)
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    return e164Regex.test(number);
  }

  /**
   * Check if the client is ready to send messages
   * 
   * Requirements: 2.1, 2.10
   * 
   * @returns true if client is initialized
   */
  async isReady(): Promise<boolean> {
    // In test mode, always return true
    if (this.config?.testMode) {
      return true;
    }
    
    return this.isInitialized && this.twilioClient !== null;
  }

  /**
   * Disconnect the Twilio client
   * No-op for Twilio (stateless API), included for interface compatibility
   * 
   * Requirements: 2.1, 2.10
   */
  async disconnect(): Promise<void> {
    logger.info('TwilioWhatsAppClient', 'Disconnect called (no-op for Twilio API)');
    // Twilio is stateless, no cleanup needed
    // This method exists for interface compatibility with WhatsAppClient
  }

  /**
   * Simulate message sending for test mode
   * 
   * Requirements: 2.8, 4.1
   * 
   * @param number - WhatsApp number in E.164 format
   * @param message - Message content to send
   * @returns DeliveryResult with simulated success
   */
  private async simulateMessageSending(number: string, message: string): Promise<DeliveryResult> {
    // Generate a fake message ID (similar to Twilio SID format)
    const messageId = `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    // Log the simulated message
    logger.info('TwilioWhatsAppClient', `[TEST MODE] Simulating message to ${number}`, {
      recipient: number,
      messageId,
      messagePreview: message.substring(0, 50) + (message.length > 50 ? '...' : '')
    });

    // Simulate a small delay
    await this.sleep(500); // 500ms delay to simulate network
    
    return {
      success: true,
      messageId,
      timestamp: new Date()
    };
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
   * Redact phone number for logging (show only last 4 digits)
   * 
   * Requirements: 5.9
   * 
   * @param phoneNumber - Phone number to redact
   * @returns Redacted phone number
   */
  private redactPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 4) {
      return '****';
    }
    const lastFour = phoneNumber.slice(-4);
    return `****${lastFour}`;
  }
}
