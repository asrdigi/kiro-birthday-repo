/**
 * WhatsApp Client Interface
 * 
 * Common interface for WhatsApp messaging clients
 * Implemented by both WhatsAppClient (whatsapp-web.js) and TwilioWhatsAppClient (Twilio API)
 */

import type { DeliveryResult } from '../models/types';

/**
 * Interface for WhatsApp messaging clients
 * 
 * Defines the contract that all WhatsApp client implementations must follow
 */
export interface IWhatsAppClient {
  /**
   * Initialize the WhatsApp client
   * 
   * @throws Error if initialization fails
   */
  initialize(): Promise<void>;

  /**
   * Send a WhatsApp message
   * 
   * @param number - WhatsApp number in E.164 format (+1234567890)
   * @param message - Message content to send
   * @returns DeliveryResult with success status and details
   */
  sendMessage(number: string, message: string): Promise<DeliveryResult>;

  /**
   * Check if the client is ready to send messages
   * 
   * @returns true if client is initialized and ready
   */
  isReady(): Promise<boolean>;

  /**
   * Disconnect the WhatsApp client
   * 
   * @throws Error if disconnection fails
   */
  disconnect(): Promise<void>;
}
