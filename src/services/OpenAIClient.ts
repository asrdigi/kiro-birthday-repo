/**
 * OpenAI API Client for ChatGPT integration
 * Handles authentication and connection to OpenAI API
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

/**
 * OpenAI client instance for generating birthday messages
 */
export class OpenAIClient {
  private client: OpenAI | null = null;
  private apiKey: string;

  constructor() {
    // Load API key from environment
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
  }

  /**
   * Initialize the OpenAI client with authentication
   * @throws Error if authentication fails
   */
  async initialize(): Promise<void> {
    try {
      // Create OpenAI client instance
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });

      // Test the connection by making a simple API call
      await this.testConnection();
      
      logger.info('OpenAIClient', 'Successfully initialized and authenticated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.critical('OpenAIClient', 'Authentication failed', { error: errorMessage });
      throw new Error(`OpenAI authentication failed: ${errorMessage}`);
    }
  }

  /**
   * Test the OpenAI API connection
   * @throws Error if connection test fails
   */
  private async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      // Make a minimal API call to verify authentication
      await this.client.models.list();
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        if (error.status === 401) {
          throw new Error('Invalid API key');
        }
        throw new Error(`API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get the OpenAI client instance
   * @returns OpenAI client instance
   * @throws Error if client is not initialized
   */
  getClient(): OpenAI {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Check if the client is initialized
   * @returns true if client is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }
}

/**
 * Singleton instance of OpenAI client
 */
let openAIClientInstance: OpenAIClient | null = null;

/**
 * Get or create the OpenAI client singleton instance
 * @returns OpenAI client instance
 */
export function getOpenAIClient(): OpenAIClient {
  if (!openAIClientInstance) {
    openAIClientInstance = new OpenAIClient();
  }
  return openAIClientInstance;
}
