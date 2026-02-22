/**
 * StateManager - Tracks sent messages to prevent duplicates
 * 
 * Manages the persistence of sent birthday messages in SQLite database.
 * Provides methods to record sent messages, check for duplicates, and
 * retrieve delivery history.
 * 
 * Requirements: 4.5, 5.1, 5.2, 5.3
 */

import { getDatabase } from './database';
import { SentMessageRecord } from '../models/types';
import { logger } from '../utils/logger';

/**
 * StateManager class for tracking sent birthday messages
 * 
 * Uses SQLite database to persist message records and prevent duplicate
 * messages from being sent to the same friend in the same calendar year.
 */
export class StateManager {
  /**
   * Records a sent birthday message in the database
   * 
   * Stores the message details including friend ID, year, message content,
   * and delivery status. The UNIQUE constraint on (friend_id, year) prevents
   * duplicate records.
   * 
   * @param friendId - Unique identifier for the friend
   * @param year - Calendar year the message was sent
   * @param messageId - WhatsApp message ID (optional)
   * @param messageContent - The actual message text that was sent
   * @param deliveryStatus - Status of the message delivery ('sent', 'failed', or 'pending')
   * @throws Error if database operation fails
   * 
   * Requirements: 4.5, 5.1
   */
  async recordSentMessage(
    friendId: string,
    year: number,
    messageId: string | null,
    messageContent: string,
    deliveryStatus: 'sent' | 'failed' | 'pending'
  ): Promise<void> {
    try {
      const db = getDatabase();
      const timestamp = new Date().toISOString();
      
      const stmt = db.prepare(`
        INSERT INTO sent_messages (friend_id, year, message_id, message_content, timestamp, delivery_status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(friendId, year, messageId, messageContent, timestamp, deliveryStatus);
      
      logger.info('StateManager', `Recorded sent message for friend ${friendId}`, {
        friendId,
        year,
        deliveryStatus
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('StateManager', `Failed to record sent message for friend ${friendId}`, {
        friendId,
        year,
        error: errorMessage
      });
      throw new Error(`Failed to record sent message for friend ${friendId}: ${errorMessage}`);
    }
  }

  /**
   * Checks if a birthday message was already sent to a friend in a given year
   * 
   * Queries the database to determine if a message record exists for the
   * specified friend and year combination.
   * 
   * @param friendId - Unique identifier for the friend
   * @param year - Calendar year to check
   * @returns true if a message was sent, false otherwise
   * @throws Error if database operation fails
   * 
   * Requirements: 5.2
   */
  async wasMessageSent(friendId: string, year: number): Promise<boolean> {
    try {
      const db = getDatabase();
      
      const stmt = db.prepare(`
        SELECT COUNT(*) as count
        FROM sent_messages
        WHERE friend_id = ? AND year = ?
      `);
      
      const result = stmt.get(friendId, year) as { count: number };
      return result.count > 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('StateManager', `Failed to check if message was sent for friend ${friendId}`, {
        friendId,
        year,
        error: errorMessage
      });
      throw new Error(`Failed to check if message was sent for friend ${friendId}: ${errorMessage}`);
    }
  }

  /**
   * Retrieves the complete delivery history for a specific friend
   * 
   * Returns all message records for the specified friend, ordered by
   * timestamp in descending order (most recent first).
   * 
   * @param friendId - Unique identifier for the friend
   * @returns Array of SentMessageRecord objects
   * @throws Error if database operation fails
   * 
   * Requirements: 5.3
   */
  async getDeliveryHistory(friendId: string): Promise<SentMessageRecord[]> {
    try {
      const db = getDatabase();
      
      const stmt = db.prepare(`
        SELECT id, friend_id, year, message_id, message_content, timestamp, delivery_status
        FROM sent_messages
        WHERE friend_id = ?
        ORDER BY timestamp DESC
      `);
      
      const rows = stmt.all(friendId) as Array<{
        id: number;
        friend_id: string;
        year: number;
        message_id: string | null;
        message_content: string;
        timestamp: string;
        delivery_status: string;
      }>;
      
      // Convert database rows to SentMessageRecord objects
      return rows.map(row => ({
        id: row.id,
        friendId: row.friend_id,
        year: row.year,
        messageId: row.message_id,
        messageContent: row.message_content,
        timestamp: new Date(row.timestamp),
        deliveryStatus: row.delivery_status as 'sent' | 'failed' | 'pending'
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('StateManager', `Failed to retrieve delivery history for friend ${friendId}`, {
        friendId,
        error: errorMessage
      });
      throw new Error(`Failed to retrieve delivery history for friend ${friendId}: ${errorMessage}`);
    }
  }
}
