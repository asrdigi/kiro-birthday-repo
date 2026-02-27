/**
 * Template-based Message Generator
 * Uses predefined message templates instead of AI generation
 */

import * as fs from 'fs';
import * as path from 'path';
import { Friend } from '../models/types';
import { logger } from '../utils/logger';

interface MessageTemplates {
  templates: {
    [language: string]: string[];
  };
  settings: {
    useEmojis: boolean;
    randomSelection: boolean;
    fallbackToAI: boolean;
  };
}

/**
 * TemplateMessageGenerator class for generating birthday messages from templates
 */
export class TemplateMessageGenerator {
  private templates: MessageTemplates | null = null;
  private templatePath: string;

  constructor(templatePath?: string) {
    this.templatePath = templatePath || path.join(process.cwd(), 'message-templates.json');
  }

  /**
   * Initialize the message generator by loading templates
   * @throws Error if template file cannot be loaded
   */
  async initialize(): Promise<void> {
    try {
      const templateContent = fs.readFileSync(this.templatePath, 'utf-8');
      this.templates = JSON.parse(templateContent);
      logger.info('TemplateMessageGenerator', 'Successfully loaded message templates');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('TemplateMessageGenerator', 'Failed to load templates', { error: errorMessage });
      throw new Error(`Failed to load message templates: ${errorMessage}`);
    }
  }

  /**
   * Generate a personalized birthday message for a friend using templates
   * @param friend Friend object containing name and mother tongue
   * @returns Generated birthday message
   * @throws Error if message generation fails
   */
  async generateMessage(friend: Friend): Promise<string> {
    if (!this.templates) {
      throw new Error('TemplateMessageGenerator not initialized. Call initialize() first.');
    }

    const { name, motherTongue } = friend;

    // Get templates for the language
    const languageTemplates = this.templates.templates[motherTongue];
    
    if (!languageTemplates || languageTemplates.length === 0) {
      throw new Error(`No templates found for language: ${motherTongue}`);
    }

    // Select a template (random or first one)
    let template: string;
    if (this.templates.settings.randomSelection) {
      const randomIndex = Math.floor(Math.random() * languageTemplates.length);
      template = languageTemplates[randomIndex];
    } else {
      template = languageTemplates[0];
    }

    // Replace placeholders
    let message = template.replace(/{name}/g, name);

    // Remove emojis if disabled
    if (!this.templates.settings.useEmojis) {
      message = this.removeEmojis(message);
    }

    // Add sender name signature
    const senderName = process.env.SENDER_NAME || 'Your Friend';
    message += `\n- ${senderName}`;

    logger.info('TemplateMessageGenerator', `Generated message for ${name} in ${motherTongue}`);
    return message;
  }

  /**
   * Remove emojis from a message
   * @param message Message text
   * @returns Message without emojis
   */
  private removeEmojis(message: string): string {
    // Remove emoji characters
    return message.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  }

  /**
   * Get available languages
   * @returns Array of language codes
   */
  getAvailableLanguages(): string[] {
    if (!this.templates) {
      return [];
    }
    return Object.keys(this.templates.templates);
  }

  /**
   * Add a new template for a language
   * @param language Language code
   * @param template Message template
   */
  addTemplate(language: string, template: string): void {
    if (!this.templates) {
      throw new Error('Templates not loaded');
    }

    if (!this.templates.templates[language]) {
      this.templates.templates[language] = [];
    }

    this.templates.templates[language].push(template);
    this.saveTemplates();
  }

  /**
   * Save templates back to file
   */
  private saveTemplates(): void {
    if (!this.templates) {
      return;
    }

    try {
      fs.writeFileSync(
        this.templatePath,
        JSON.stringify(this.templates, null, 2),
        'utf-8'
      );
      logger.info('TemplateMessageGenerator', 'Templates saved successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('TemplateMessageGenerator', 'Failed to save templates', { error: errorMessage });
    }
  }
}
