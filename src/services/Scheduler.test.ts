/**
 * Unit tests for Scheduler service
 * 
 * Tests the birthday checking and processing workflow with mocked dependencies.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Scheduler } from './Scheduler';
import { DataLoader } from './DataLoader';
import { MessageGenerator } from './MessageGenerator';
import { WhatsAppClient } from './WhatsAppClient';
import { StateManager } from './StateManager';
import { Friend, DeliveryResult } from '../models/types';

// Mock the timezone utility
vi.mock('../utils/timezone', () => ({
  isBirthdayToday: vi.fn()
}));

// Mock the logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    critical: vi.fn()
  }
}));

// Mock node-cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(() => ({
      stop: vi.fn()
    }))
  }
}));

describe('Scheduler', () => {
  let scheduler: Scheduler;
  let mockDataLoader: DataLoader;
  let mockMessageGenerator: MessageGenerator;
  let mockWhatsAppClient: WhatsAppClient;
  let mockStateManager: StateManager;

  const mockFriend: Friend = {
    id: 'friend-1',
    name: 'John Doe',
    birthdate: new Date('1990-05-15'),
    motherTongue: 'en',
    whatsappNumber: '+1234567890',
    country: 'USA',
    timezone: 'America/New_York'
  };

  beforeEach(() => {
    // Create mock instances
    mockDataLoader = {
      loadFriends: vi.fn(),
      refreshCache: vi.fn()
    } as any;

    mockMessageGenerator = {
      generateMessage: vi.fn()
    } as any;

    mockWhatsAppClient = {
      isReady: vi.fn(),
      sendMessage: vi.fn()
    } as any;

    mockStateManager = {
      wasMessageSent: vi.fn(),
      recordSentMessage: vi.fn()
    } as any;

    scheduler = new Scheduler(
      mockDataLoader,
      mockMessageGenerator,
      mockWhatsAppClient,
      mockStateManager
    );
  });

  describe('checkBirthdays', () => {
    it('should check all friends for birthdays', async () => {
      const friends: Friend[] = [mockFriend];
      vi.mocked(mockDataLoader.loadFriends).mockResolvedValue(friends);
      
      const { isBirthdayToday } = await import('../utils/timezone');
      vi.mocked(isBirthdayToday).mockReturnValue(false);

      await scheduler.checkBirthdays();

      expect(mockDataLoader.loadFriends).toHaveBeenCalledOnce();
      expect(isBirthdayToday).toHaveBeenCalledWith(mockFriend.birthdate, mockFriend.country);
    });

    it('should process birthday when detected', async () => {
      const friends: Friend[] = [mockFriend];
      vi.mocked(mockDataLoader.loadFriends).mockResolvedValue(friends);
      
      const { isBirthdayToday } = await import('../utils/timezone');
      vi.mocked(isBirthdayToday).mockReturnValue(true);
      
      vi.mocked(mockStateManager.wasMessageSent).mockResolvedValue(false);
      vi.mocked(mockMessageGenerator.generateMessage).mockResolvedValue('Happy Birthday!');
      
      const deliveryResult: DeliveryResult = {
        success: true,
        messageId: 'msg-123',
        timestamp: new Date()
      };
      vi.mocked(mockWhatsAppClient.sendMessage).mockResolvedValue(deliveryResult);

      await scheduler.checkBirthdays();

      expect(isBirthdayToday).toHaveBeenCalledWith(mockFriend.birthdate, mockFriend.country);
      expect(mockStateManager.wasMessageSent).toHaveBeenCalled();
      expect(mockMessageGenerator.generateMessage).toHaveBeenCalledWith(mockFriend);
      expect(mockWhatsAppClient.sendMessage).toHaveBeenCalled();
    });

    it('should continue checking other friends if one fails', async () => {
      const friend2: Friend = { ...mockFriend, id: 'friend-2', name: 'Jane Doe' };
      const friends: Friend[] = [mockFriend, friend2];
      
      vi.mocked(mockDataLoader.loadFriends).mockResolvedValue(friends);
      
      const { isBirthdayToday } = await import('../utils/timezone');
      
      // Clear previous calls
      vi.mocked(isBirthdayToday).mockClear();
      
      vi.mocked(isBirthdayToday)
        .mockImplementationOnce(() => { throw new Error('Timezone error'); })
        .mockReturnValueOnce(false);

      await scheduler.checkBirthdays();

      expect(isBirthdayToday).toHaveBeenCalledTimes(2);
    });
  });

  describe('processBirthday', () => {
    it('should skip if message already sent this year', async () => {
      vi.mocked(mockStateManager.wasMessageSent).mockResolvedValue(true);

      await scheduler.processBirthday(mockFriend);

      expect(mockStateManager.wasMessageSent).toHaveBeenCalled();
      expect(mockMessageGenerator.generateMessage).not.toHaveBeenCalled();
      expect(mockWhatsAppClient.sendMessage).not.toHaveBeenCalled();
    });

    it('should generate and send message if not sent this year', async () => {
      vi.mocked(mockStateManager.wasMessageSent).mockResolvedValue(false);
      vi.mocked(mockMessageGenerator.generateMessage).mockResolvedValue('Happy Birthday John!');
      
      const deliveryResult: DeliveryResult = {
        success: true,
        messageId: 'msg-123',
        timestamp: new Date()
      };
      vi.mocked(mockWhatsAppClient.sendMessage).mockResolvedValue(deliveryResult);

      await scheduler.processBirthday(mockFriend);

      expect(mockMessageGenerator.generateMessage).toHaveBeenCalledWith(mockFriend);
      expect(mockWhatsAppClient.sendMessage).toHaveBeenCalledWith(
        mockFriend.whatsappNumber,
        'Happy Birthday John!'
      );
      expect(mockStateManager.recordSentMessage).toHaveBeenCalledWith(
        mockFriend.id,
        expect.any(Number),
        'msg-123',
        'Happy Birthday John!',
        'sent'
      );
    });

    it('should record failed delivery', async () => {
      vi.mocked(mockStateManager.wasMessageSent).mockResolvedValue(false);
      vi.mocked(mockMessageGenerator.generateMessage).mockResolvedValue('Happy Birthday!');
      
      const deliveryResult: DeliveryResult = {
        success: false,
        timestamp: new Date(),
        error: 'Network error'
      };
      vi.mocked(mockWhatsAppClient.sendMessage).mockResolvedValue(deliveryResult);

      await scheduler.processBirthday(mockFriend);

      expect(mockStateManager.recordSentMessage).toHaveBeenCalledWith(
        mockFriend.id,
        expect.any(Number),
        null,
        'Happy Birthday!',
        'failed'
      );
    });

    it('should record failed attempt if message generation fails', async () => {
      vi.mocked(mockStateManager.wasMessageSent).mockResolvedValue(false);
      vi.mocked(mockMessageGenerator.generateMessage).mockRejectedValue(
        new Error('ChatGPT API error')
      );

      await scheduler.processBirthday(mockFriend);

      expect(mockStateManager.recordSentMessage).toHaveBeenCalledWith(
        mockFriend.id,
        expect.any(Number),
        null,
        expect.stringContaining('Failed to generate/send message'),
        'failed'
      );
    });
  });

  describe('validateStartup', () => {
    it('should validate all API connections', async () => {
      vi.mocked(mockWhatsAppClient.isReady).mockResolvedValue(true);
      vi.mocked(mockDataLoader.loadFriends).mockResolvedValue([]);

      await scheduler.start();

      expect(mockWhatsAppClient.isReady).toHaveBeenCalled();
      expect(mockDataLoader.loadFriends).toHaveBeenCalled();
    });

    it('should throw error if WhatsApp client is not ready', async () => {
      vi.mocked(mockWhatsAppClient.isReady).mockResolvedValue(false);

      await expect(scheduler.start()).rejects.toThrow('WhatsApp client is not ready');
    });

    it('should throw error if DataLoader fails', async () => {
      vi.mocked(mockWhatsAppClient.isReady).mockResolvedValue(true);
      vi.mocked(mockDataLoader.loadFriends).mockRejectedValue(
        new Error('Google Sheets API error')
      );

      await expect(scheduler.start()).rejects.toThrow();
    });
  });
});
