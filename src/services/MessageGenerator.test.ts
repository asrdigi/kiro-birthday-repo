/**
 * Unit tests for MessageGenerator
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MessageGenerator } from './MessageGenerator';
import { Friend } from '../models/types';
import OpenAI from 'openai';

// Mock the OpenAI module
vi.mock('openai');

// Mock the OpenAIClient
vi.mock('./OpenAIClient', () => ({
  getOpenAIClient: vi.fn(() => ({
    initialize: vi.fn(),
    getClient: vi.fn(() => mockOpenAIInstance),
    isInitialized: vi.fn(() => true),
  })),
}));

// Create a mock OpenAI instance
const mockOpenAIInstance = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
  models: {
    list: vi.fn(),
  },
} as unknown as OpenAI;

describe('MessageGenerator', () => {
  let messageGenerator: MessageGenerator;
  let mockFriend: Friend;

  beforeEach(() => {
    messageGenerator = new MessageGenerator();
    mockFriend = {
      id: '1',
      name: 'Maria Garcia',
      birthdate: new Date('1990-05-15'),
      motherTongue: 'es',
      whatsappNumber: '+34612345678',
      country: 'Spain',
      timezone: 'Europe/Madrid',
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(messageGenerator.initialize()).resolves.not.toThrow();
    });
  });

  describe('generateMessage', () => {
    it('should generate a birthday message successfully', async () => {
      // Mock successful API response
      const mockMessage = '¡Feliz cumpleaños, Maria! Espero que tengas un día maravilloso lleno de alegría y amor.';
      vi.mocked(mockOpenAIInstance.chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: mockMessage,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
      } as any);

      await messageGenerator.initialize();
      const result = await messageGenerator.generateMessage(mockFriend);

      expect(result).toBe(mockMessage);
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledTimes(1);
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' }),
          ]),
        })
      );
    });

    it('should include friend name in the prompt', async () => {
      const mockMessage = 'Happy Birthday!';
      vi.mocked(mockOpenAIInstance.chat.completions.create).mockResolvedValue({
        choices: [{ message: { content: mockMessage, role: 'assistant' }, finish_reason: 'stop', index: 0 }],
      } as any);

      await messageGenerator.initialize();
      await messageGenerator.generateMessage(mockFriend);

      const callArgs = vi.mocked(mockOpenAIInstance.chat.completions.create).mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user')?.content;

      expect(userMessage).toContain(mockFriend.name);
      expect(userMessage).toContain(mockFriend.motherTongue);
    });

    it('should throw error if not initialized', async () => {
      await expect(messageGenerator.generateMessage(mockFriend)).rejects.toThrow(
        'MessageGenerator not initialized'
      );
    });

    it('should throw error if API returns empty response', async () => {
      vi.mocked(mockOpenAIInstance.chat.completions.create).mockResolvedValue({
        choices: [{ message: { content: '', role: 'assistant' }, finish_reason: 'stop', index: 0 }],
      } as any);

      await messageGenerator.initialize();
      await expect(messageGenerator.generateMessage(mockFriend)).rejects.toThrow();
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      await messageGenerator.initialize();
      const result = await messageGenerator.retryWithBackoff(mockFn, 3);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry with exponential backoff on failure', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValueOnce('success');

      await messageGenerator.initialize();
      const startTime = Date.now();
      const result = await messageGenerator.retryWithBackoff(mockFn, 3);
      const duration = Date.now() - startTime;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
      // Should have waited at least 1s + 2s = 3s
      expect(duration).toBeGreaterThanOrEqual(3000);
    });

    it('should throw error after all retries fail', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('API error'));

      await messageGenerator.initialize();
      await expect(messageGenerator.retryWithBackoff(mockFn, 3)).rejects.toThrow('API error');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should use correct backoff delays (1s, 2s, 4s)', async () => {
      const delays: number[] = [];
      let callCount = 0;

      const mockFn = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error('Failed'));
      });

      await messageGenerator.initialize();
      const startTime = Date.now();
      
      try {
        await messageGenerator.retryWithBackoff(mockFn, 3);
      } catch {
        // Expected to fail
      }

      const totalDuration = Date.now() - startTime;

      // Should have made 3 attempts
      expect(callCount).toBe(3);
      
      // Total duration should be at least 1s + 2s = 3s (allowing for some variance)
      expect(totalDuration).toBeGreaterThanOrEqual(2900);
      expect(totalDuration).toBeLessThanOrEqual(3200);
    });
  });

  describe('error handling and logging', () => {
    it('should log error with timestamp and component name on failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(mockOpenAIInstance.chat.completions.create).mockRejectedValue(
        new Error('API error')
      );

      await messageGenerator.initialize();
      
      try {
        await messageGenerator.generateMessage(mockFriend);
      } catch {
        // Expected to fail
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      // Look for the final error message after all retries
      const errorCall = consoleErrorSpy.mock.calls.find((call) =>
        call[0].includes('[ERROR]') && call[0].includes('[MessageGenerator]') && call[0].includes('Failed to generate message')
      );
      expect(errorCall).toBeDefined();
      expect(errorCall![0]).toContain('MessageGenerator');
      expect(errorCall![0]).toContain('Failed to generate message');
    });

    it('should notify user on final failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(mockOpenAIInstance.chat.completions.create).mockRejectedValue(
        new Error('API error')
      );

      await messageGenerator.initialize();
      
      try {
        await messageGenerator.generateMessage(mockFriend);
      } catch {
        // Expected to fail
      }

      // Check that critical notification was logged
      const notificationCall = consoleErrorSpy.mock.calls.find((call) =>
        call[0].includes('[CRITICAL]') && call[0].includes('[MessageGenerator]')
      );
      expect(notificationCall).toBeDefined();
      expect(notificationCall![0]).toContain('Message generation failed - critical error');
    });
  });
});
