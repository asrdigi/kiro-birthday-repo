/**
 * Unit tests for StateManager class
 * 
 * Tests requirements 4.5, 5.1, 5.2, 5.3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StateManager } from '../src/services/StateManager';
import { initializeDatabase, closeDatabase } from '../src/services/database';
import fs from 'fs';
import path from 'path';

describe('StateManager', () => {
  const testDbPath = path.join(process.cwd(), 'data', 'test_state_manager.db');
  let stateManager: StateManager;

  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    if (fs.existsSync(`${testDbPath}-shm`)) {
      fs.unlinkSync(`${testDbPath}-shm`);
    }
    if (fs.existsSync(`${testDbPath}-wal`)) {
      fs.unlinkSync(`${testDbPath}-wal`);
    }

    // Initialize database and StateManager
    initializeDatabase(testDbPath);
    stateManager = new StateManager();
  });

  afterEach(() => {
    // Close database connection
    closeDatabase();
    
    // Clean up test database files
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    if (fs.existsSync(`${testDbPath}-shm`)) {
      fs.unlinkSync(`${testDbPath}-shm`);
    }
    if (fs.existsSync(`${testDbPath}-wal`)) {
      fs.unlinkSync(`${testDbPath}-wal`);
    }
  });

  describe('recordSentMessage', () => {
    it('should record a sent message successfully', async () => {
      await stateManager.recordSentMessage(
        'friend1',
        2024,
        'msg123',
        'Happy Birthday!',
        'sent'
      );

      const wasSent = await stateManager.wasMessageSent('friend1', 2024);
      expect(wasSent).toBe(true);
    });

    it('should record a message with null messageId', async () => {
      await stateManager.recordSentMessage(
        'friend2',
        2024,
        null,
        'Happy Birthday!',
        'pending'
      );

      const wasSent = await stateManager.wasMessageSent('friend2', 2024);
      expect(wasSent).toBe(true);
    });

    it('should record messages with different delivery statuses', async () => {
      await stateManager.recordSentMessage('friend3', 2024, 'msg1', 'Message 1', 'sent');
      await stateManager.recordSentMessage('friend4', 2024, 'msg2', 'Message 2', 'failed');
      await stateManager.recordSentMessage('friend5', 2024, 'msg3', 'Message 3', 'pending');

      expect(await stateManager.wasMessageSent('friend3', 2024)).toBe(true);
      expect(await stateManager.wasMessageSent('friend4', 2024)).toBe(true);
      expect(await stateManager.wasMessageSent('friend5', 2024)).toBe(true);
    });

    it('should throw error when trying to record duplicate message for same friend and year', async () => {
      await stateManager.recordSentMessage('friend1', 2024, 'msg1', 'Message 1', 'sent');

      await expect(
        stateManager.recordSentMessage('friend1', 2024, 'msg2', 'Message 2', 'sent')
      ).rejects.toThrow();
    });

    it('should allow recording messages for same friend in different years', async () => {
      await stateManager.recordSentMessage('friend1', 2023, 'msg1', 'Message 2023', 'sent');
      await stateManager.recordSentMessage('friend1', 2024, 'msg2', 'Message 2024', 'sent');

      expect(await stateManager.wasMessageSent('friend1', 2023)).toBe(true);
      expect(await stateManager.wasMessageSent('friend1', 2024)).toBe(true);
    });

    it('should allow recording messages for different friends in same year', async () => {
      await stateManager.recordSentMessage('friend1', 2024, 'msg1', 'Message 1', 'sent');
      await stateManager.recordSentMessage('friend2', 2024, 'msg2', 'Message 2', 'sent');

      expect(await stateManager.wasMessageSent('friend1', 2024)).toBe(true);
      expect(await stateManager.wasMessageSent('friend2', 2024)).toBe(true);
    });
  });

  describe('wasMessageSent', () => {
    it('should return false when no message was sent', async () => {
      const wasSent = await stateManager.wasMessageSent('friend1', 2024);
      expect(wasSent).toBe(false);
    });

    it('should return true when message was sent', async () => {
      await stateManager.recordSentMessage('friend1', 2024, 'msg1', 'Happy Birthday!', 'sent');
      
      const wasSent = await stateManager.wasMessageSent('friend1', 2024);
      expect(wasSent).toBe(true);
    });

    it('should return false for different year', async () => {
      await stateManager.recordSentMessage('friend1', 2023, 'msg1', 'Happy Birthday!', 'sent');
      
      const wasSent = await stateManager.wasMessageSent('friend1', 2024);
      expect(wasSent).toBe(false);
    });

    it('should return false for different friend', async () => {
      await stateManager.recordSentMessage('friend1', 2024, 'msg1', 'Happy Birthday!', 'sent');
      
      const wasSent = await stateManager.wasMessageSent('friend2', 2024);
      expect(wasSent).toBe(false);
    });

    it('should correctly identify messages with failed status', async () => {
      await stateManager.recordSentMessage('friend1', 2024, 'msg1', 'Happy Birthday!', 'failed');
      
      const wasSent = await stateManager.wasMessageSent('friend1', 2024);
      expect(wasSent).toBe(true);
    });

    it('should correctly identify messages with pending status', async () => {
      await stateManager.recordSentMessage('friend1', 2024, 'msg1', 'Happy Birthday!', 'pending');
      
      const wasSent = await stateManager.wasMessageSent('friend1', 2024);
      expect(wasSent).toBe(true);
    });
  });

  describe('getDeliveryHistory', () => {
    it('should return empty array when no messages exist', async () => {
      const history = await stateManager.getDeliveryHistory('friend1');
      expect(history).toEqual([]);
    });

    it('should return single message record', async () => {
      await stateManager.recordSentMessage(
        'friend1',
        2024,
        'msg123',
        'Happy Birthday!',
        'sent'
      );

      const history = await stateManager.getDeliveryHistory('friend1');
      expect(history).toHaveLength(1);
      expect(history[0].friendId).toBe('friend1');
      expect(history[0].year).toBe(2024);
      expect(history[0].messageId).toBe('msg123');
      expect(history[0].messageContent).toBe('Happy Birthday!');
      expect(history[0].deliveryStatus).toBe('sent');
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });

    it('should return multiple message records for same friend', async () => {
      await stateManager.recordSentMessage('friend1', 2022, 'msg1', 'Message 2022', 'sent');
      await stateManager.recordSentMessage('friend1', 2023, 'msg2', 'Message 2023', 'sent');
      await stateManager.recordSentMessage('friend1', 2024, 'msg3', 'Message 2024', 'sent');

      const history = await stateManager.getDeliveryHistory('friend1');
      expect(history).toHaveLength(3);
      expect(history.map(h => h.year)).toContain(2022);
      expect(history.map(h => h.year)).toContain(2023);
      expect(history.map(h => h.year)).toContain(2024);
    });

    it('should return messages in descending order by timestamp (most recent first)', async () => {
      // Record messages with slight delays to ensure different timestamps
      await stateManager.recordSentMessage('friend1', 2022, 'msg1', 'Message 2022', 'sent');
      await new Promise(resolve => setTimeout(resolve, 10));
      await stateManager.recordSentMessage('friend1', 2023, 'msg2', 'Message 2023', 'sent');
      await new Promise(resolve => setTimeout(resolve, 10));
      await stateManager.recordSentMessage('friend1', 2024, 'msg3', 'Message 2024', 'sent');

      const history = await stateManager.getDeliveryHistory('friend1');
      expect(history).toHaveLength(3);
      
      // Most recent should be first
      expect(history[0].year).toBe(2024);
      expect(history[1].year).toBe(2023);
      expect(history[2].year).toBe(2022);
    });

    it('should only return messages for the specified friend', async () => {
      await stateManager.recordSentMessage('friend1', 2024, 'msg1', 'Message 1', 'sent');
      await stateManager.recordSentMessage('friend2', 2024, 'msg2', 'Message 2', 'sent');
      await stateManager.recordSentMessage('friend3', 2024, 'msg3', 'Message 3', 'sent');

      const history = await stateManager.getDeliveryHistory('friend1');
      expect(history).toHaveLength(1);
      expect(history[0].friendId).toBe('friend1');
    });

    it('should include all record fields correctly', async () => {
      await stateManager.recordSentMessage(
        'friend1',
        2024,
        'msg123',
        'Happy Birthday, John!',
        'sent'
      );

      const history = await stateManager.getDeliveryHistory('friend1');
      const record = history[0];
      
      expect(record.id).toBeGreaterThan(0);
      expect(record.friendId).toBe('friend1');
      expect(record.year).toBe(2024);
      expect(record.messageId).toBe('msg123');
      expect(record.messageContent).toBe('Happy Birthday, John!');
      expect(record.deliveryStatus).toBe('sent');
      expect(record.timestamp).toBeInstanceOf(Date);
    });

    it('should handle null messageId correctly', async () => {
      await stateManager.recordSentMessage(
        'friend1',
        2024,
        null,
        'Happy Birthday!',
        'pending'
      );

      const history = await stateManager.getDeliveryHistory('friend1');
      expect(history).toHaveLength(1);
      expect(history[0].messageId).toBeNull();
    });

    it('should include messages with different delivery statuses', async () => {
      await stateManager.recordSentMessage('friend1', 2022, 'msg1', 'Message 1', 'sent');
      await stateManager.recordSentMessage('friend1', 2023, 'msg2', 'Message 2', 'failed');
      await stateManager.recordSentMessage('friend1', 2024, 'msg3', 'Message 3', 'pending');

      const history = await stateManager.getDeliveryHistory('friend1');
      expect(history).toHaveLength(3);
      
      const statuses = history.map(h => h.deliveryStatus);
      expect(statuses).toContain('sent');
      expect(statuses).toContain('failed');
      expect(statuses).toContain('pending');
    });
  });

  describe('error handling', () => {
    it('should throw descriptive error when database operation fails in recordSentMessage', async () => {
      // Close the database to simulate a failure
      closeDatabase();

      await expect(
        stateManager.recordSentMessage('friend1', 2024, 'msg1', 'Message', 'sent')
      ).rejects.toThrow(/Failed to record sent message for friend friend1/);
    });

    it('should throw descriptive error when database operation fails in wasMessageSent', async () => {
      // Close the database to simulate a failure
      closeDatabase();

      await expect(
        stateManager.wasMessageSent('friend1', 2024)
      ).rejects.toThrow(/Failed to check if message was sent for friend friend1/);
    });

    it('should throw descriptive error when database operation fails in getDeliveryHistory', async () => {
      // Close the database to simulate a failure
      closeDatabase();

      await expect(
        stateManager.getDeliveryHistory('friend1')
      ).rejects.toThrow(/Failed to retrieve delivery history for friend friend1/);
    });
  });
});
