/**
 * Message Generator for creating personalized birthday messages using ChatGPT
 * Implements retry logic with exponential backoff
 */

import OpenAI from 'openai';
import { Friend } from '../models/types';
import { getOpenAIClient } from './OpenAIClient';
import { logger } from '../utils/logger';

/**
 * MessageGenerator class for generating birthday messages using ChatGPT
 */
export class MessageGenerator {
  private openAIClient: OpenAI | null = null;

  /**
   * Initialize the message generator
   * @throws Error if OpenAI client initialization fails
   */
  async initialize(): Promise<void> {
    try {
      const client = getOpenAIClient();
      await client.initialize();
      this.openAIClient = client.getClient();
      logger.info('MessageGenerator', 'Successfully initialized');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('MessageGenerator', 'Initialization failed', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Generate a personalized birthday message for a friend
   * @param friend Friend object containing name and mother tongue
   * @returns Generated birthday message
   * @throws Error if message generation fails after all retries
   */
  async generateMessage(friend: Friend): Promise<string> {
    if (!this.openAIClient) {
      throw new Error('MessageGenerator not initialized. Call initialize() first.');
    }

    const { name, motherTongue } = friend;

    // Create structured prompt for ChatGPT
    const prompt = this.createPrompt(name, motherTongue);

    try {
      // Generate message with retry logic
      const message = await this.retryWithBackoff(
        async () => await this.callChatGPT(prompt),
        3 // max retries
      );

      logger.info('MessageGenerator', `Successfully generated message for ${name} in ${motherTongue}`);
      return message;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log error with timestamp and component name
      logger.error('MessageGenerator', `Failed to generate message for ${name} after all retries`, {
        friendName: name,
        motherTongue,
        error: errorMessage
      });

      // Notify user of final failure
      this.notifyUserOfFailure(friend, errorMessage);

      throw new Error(`Failed to generate birthday message for ${name}: ${errorMessage}`);
    }
  }

  /**
   * Create a structured prompt for ChatGPT
   * @param name Friend's name
   * @param language Language code for the message
   * @returns Formatted prompt string
   */
  private createPrompt(name: string, language: string): string {
    const languageMap: { [key: string]: string } = {
      'te': 'Telugu',
      'hi': 'Hindi',
      'en': 'English',
      'ta': 'Tamil',
      'kn': 'Kannada',
      'ml': 'Malayalam'
    };
    
    const fullLanguageName = languageMap[language] || language;
    
    // Get sender name from environment variable (default to "Your Friend" if not set)
    const senderName = process.env.SENDER_NAME || 'Your Friend';
    
    // Get custom message style from environment (default to warm and personal)
    const messageStyle = process.env.MESSAGE_STYLE || 'casual';
    
    // Check if emojis should be included (default to true)
    const useEmojis = process.env.USE_EMOJIS !== 'false';
    
    const emojiGuidance = useEmojis 
      ? `- Include 2-3 relevant emojis throughout the message (birthday cake 🎂, party 🎉, celebration 🎊, balloon 🎈, gift 🎁, sparkles ✨, etc.)
- Place emojis naturally within the text, not all at the beginning or end
- Use emojis that enhance the message, don't overdo it`
      : '- Do NOT include any emojis or special characters';
    
    return `Generate a heartfelt, natural birthday message for ${name} in ${fullLanguageName}.

IMPORTANT - Message Style:
- Write like a close friend, NOT like a formal greeting card
- Use simple, everyday language that feels genuine and personal
- Sound natural and conversational, as if you're speaking directly to them
- Avoid flowery, poetic, or overly formal language
- Keep it short and sweet (2-3 sentences maximum)
- Express genuine warmth without being dramatic

${emojiGuidance}

Requirements:
- Write in natural, conversational ${fullLanguageName}
- Use casual, friendly tone (like texting a good friend)
- Avoid phrases like "May your day be filled with..." or "Wishing you endless..."
- Instead use simple expressions like "Hope you have an amazing day!" or "Enjoy your special day!"
- Be warm but not overly sentimental
- End with a signature: "- ${senderName}"
- Make it feel personal and authentic, not AI-generated

Examples of the tone to aim for${useEmojis ? ' (with emojis)' : ''}:
${useEmojis 
  ? `- "Hey! 🎉 Happy birthday! Hope you have an awesome day filled with fun and laughter. 🎂"
- "Happy birthday! 🎊 Wishing you all the best today and always. Have a great one! 🎈"
- "Birthday wishes! 🎁 Hope this year brings you lots of happiness and success. ✨"`
  : `- "Hey! Happy birthday! Hope you have an awesome day filled with fun and laughter."
- "Happy birthday! Wishing you all the best today and always. Have a great one!"
- "Birthday wishes! Hope this year brings you lots of happiness and success."`
}

Generate ONLY the birthday message with the signature, nothing else.`;
  }

  /**
   * Call ChatGPT API to generate a message
   * @param prompt The prompt to send to ChatGPT
   * @returns Generated message text
   * @throws Error if API call fails
   */
  private async callChatGPT(prompt: string): Promise<string> {
    if (!this.openAIClient) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.openAIClient.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a close friend writing a birthday message. Write naturally and casually, like you\'re texting a good friend. Avoid formal, flowery, or poetic language. Keep it simple, warm, and genuine. Sound like a real person, not an AI.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8, // Slightly higher for more natural variation
        max_tokens: 300, // Reduced since we want shorter, punchier messages
      });

      const message = response.choices[0]?.message?.content?.trim();

      if (!message) {
        throw new Error('Empty response from ChatGPT API');
      }

      return message;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`ChatGPT API error (${error.status}): ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Retry a function with exponential backoff
   * @param fn Function to retry
   * @param maxRetries Maximum number of retry attempts (total attempts = maxRetries)
   * @returns Result of the function
   * @throws Error if all retries fail
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    const delays = [1000, 2000, 4000]; // 1s, 2s, 4s in milliseconds
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Log retry attempt
        logger.error('MessageGenerator', `Attempt ${attempt + 1}/${maxRetries} failed`, {
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message
        });

        // If this was the last attempt, don't wait
        if (attempt === maxRetries - 1) {
          break;
        }

        // Wait before retrying with exponential backoff
        const delay = delays[attempt] || delays[delays.length - 1];
        logger.info('MessageGenerator', `Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    // All retries failed
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Sleep for a specified duration
   * @param ms Duration in milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Notify user of message generation failure
   * @param friend Friend for whom message generation failed
   * @param error Error message
   */
  private notifyUserOfFailure(friend: Friend, error: string): void {
    logger.critical('MessageGenerator', 'Message generation failed - critical error', {
      friendId: friend.id,
      friendName: friend.name,
      motherTongue: friend.motherTongue,
      error
    });

    // TODO: Implement email/webhook notification if configured
    // This would check for NOTIFICATION_EMAIL or webhook URL in environment
    // and send the notification accordingly
  }
}
