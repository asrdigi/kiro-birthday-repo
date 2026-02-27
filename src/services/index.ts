/**
 * Services module exports
 * 
 * Centralized exports for all service classes
 */

export { initializeDatabase, getDatabase, closeDatabase, isDatabaseInitialized } from './database';
export { StateManager } from './StateManager';
export { GoogleSheetsClient } from './GoogleSheetsClient';
export { DataLoader } from './DataLoader';
export { OpenAIClient, getOpenAIClient } from './OpenAIClient';
export { MessageGenerator } from './MessageGenerator';
export { TwilioWhatsAppClient } from './TwilioWhatsAppClient';

// Export TwilioWhatsAppClient as WhatsAppClient for backward compatibility
// This allows test scripts to work without modifications
export { TwilioWhatsAppClient as WhatsAppClient } from './TwilioWhatsAppClient';
