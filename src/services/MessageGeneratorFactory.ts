/**
 * Factory for creating the appropriate message generator based on configuration
 */

import { MessageGenerator } from './MessageGenerator';
import { TemplateMessageGenerator } from './TemplateMessageGenerator';
import { Friend } from '../models/types';
import { logger } from '../utils/logger';

/**
 * Interface that both generators must implement
 */
export interface IMessageGenerator {
  initialize(): Promise<void>;
  generateMessage(friend: Friend): Promise<string>;
}

/**
 * Factory class to create the appropriate message generator
 */
export class MessageGeneratorFactory {
  /**
   * Create a message generator based on MESSAGE_MODE environment variable
   * @returns MessageGenerator instance (AI or Template based)
   */
  static create(): IMessageGenerator {
    const mode = process.env.MESSAGE_MODE || 'ai';
    
    if (mode === 'template') {
      logger.info('MessageGeneratorFactory', 'Using template-based message generation');
      return new TemplateMessageGenerator();
    } else {
      logger.info('MessageGeneratorFactory', 'Using AI-based message generation');
      return new MessageGenerator();
    }
  }
}
