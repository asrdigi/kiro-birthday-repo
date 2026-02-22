/**
 * Unit tests for WhatsAppClient
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhatsAppClient } from './WhatsAppClient';
import type { DeliveryResult } from '../models/types';

// Mock whatsapp-web.js
vi.mock('whatsapp-web.js', () => {
  const mockClient = {
    initialize: vi.fn(),
    on: vi.fn(),
    sendMessage: vi.fn(),
    destroy: vi.fn(),
  };

  return {
    Client: vi.fn(() => mockClient),
    LocalAuth: vi.fn(),
  };
});

// Mock qrcode-terminal
vi.mock('qrcode-terminal', () => ({
  default: {
    generate: vi.fn(),
  },
}));

describe('WhatsAppClient', () => {
  let whatsappClient: WhatsAppClient;
  let mockClientInstance: any;
  let MockClient: any;

  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create a fresh mock client instance for each test
    mockClientInstance = {
      initialize: vi.fn(),
      on: vi.fn(),
      sendMessage: vi.fn(),
      destroy: vi.fn(),
    };

    // Get the mocked Client constructor and make it return our mock instance
    const whatsappModule = await import('whatsapp-web.js');
    MockClient = vi.mocked(whatsappModule.Client);
    MockClient.mockReturnValue(mockClientInstance);

    // Create a new WhatsAppClient instance
    whatsappClient = new WhatsAppClient();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully and set up event handlers', async () => {
      mockClientInstance.initialize.mockResolvedValue(undefined);

      await whatsappClient.initialize();

      expect(mockClientInstance.initialize).toHaveBeenCalledTimes(1);
      expect(mockClientInstance.on).toHaveBeenCalledWith('qr', expect.any(Function));
      expect(mockClientInstance.on).toHaveBeenCalledWith('authenticated', expect.any(Function));
      expect(mockClientInstance.on).toHaveBeenCalledWith('auth_failure', expect.any(Function));
      expect(mockClientInstance.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockClientInstance.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
    });

    it('should throw error on authentication failure', async () => {
      mockClientInstance.initialize.mockRejectedValue(new Error('Auth failed'));

      await expect(whatsappClient.initialize()).rejects.toThrow('WhatsApp authentication failed');
    });

    it('should log error with timestamp on authentication failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClientInstance.initialize.mockRejectedValue(new Error('Auth failed'));

      try {
        await whatsappClient.initialize();
      } catch {
        // Expected to fail
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls.find((call) =>
        call[0].includes('[WhatsAppClient]')
      );
      expect(errorCall).toBeDefined();
      expect(errorCall![0]).toContain('Authentication failed');
    });
  });

  describe('isReady', () => {
    it('should return false before initialization', async () => {
      const ready = await whatsappClient.isReady();
      expect(ready).toBe(false);
    });

    it('should return true after successful initialization and connection', async () => {
      mockClientInstance.initialize.mockResolvedValue(undefined);
      
      await whatsappClient.initialize();
      
      // Simulate the 'ready' event
      const readyHandler = mockClientInstance.on.mock.calls.find(
        (call: any) => call[0] === 'ready'
      )?.[1];
      if (readyHandler) readyHandler();

      const ready = await whatsappClient.isReady();
      expect(ready).toBe(true);
    });
  });

  describe('sendMessage', () => {
    beforeEach(async () => {
      mockClientInstance.initialize.mockResolvedValue(undefined);
      await whatsappClient.initialize();
      
      // Simulate the 'ready' event to make client ready
      const readyHandler = mockClientInstance.on.mock.calls.find(
        (call: any) => call[0] === 'ready'
      )?.[1];
      if (readyHandler) readyHandler();
    });

    it('should send message successfully on first attempt', async () => {
      const mockSentMessage = {
        id: { id: 'msg123' },
      };
      mockClientInstance.sendMessage.mockResolvedValue(mockSentMessage);

      const result = await whatsappClient.sendMessage('+1234567890', 'Happy Birthday!');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg123');
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(mockClientInstance.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockClientInstance.sendMessage).toHaveBeenCalledWith('1234567890@c.us', 'Happy Birthday!');
    });

    it('should format phone number correctly (remove + and add @c.us)', async () => {
      const mockSentMessage = { id: { id: 'msg123' } };
      mockClientInstance.sendMessage.mockResolvedValue(mockSentMessage);

      await whatsappClient.sendMessage('+34612345678', 'Test message');

      expect(mockClientInstance.sendMessage).toHaveBeenCalledWith('34612345678@c.us', 'Test message');
    });

    it('should retry up to 3 times with 5-minute intervals on failure', async () => {
      vi.useFakeTimers();
      
      mockClientInstance.sendMessage
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: { id: 'msg123' } });

      const sendPromise = whatsappClient.sendMessage('+1234567890', 'Test');

      // Fast-forward through the retry delays
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000); // First retry delay
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000); // Second retry delay

      const result = await sendPromise;

      expect(result.success).toBe(true);
      expect(mockClientInstance.sendMessage).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('should return failure after 3 failed attempts', async () => {
      vi.useFakeTimers();
      
      mockClientInstance.sendMessage.mockRejectedValue(new Error('Network error'));

      const sendPromise = whatsappClient.sendMessage('+1234567890', 'Test');

      // Fast-forward through all retry delays
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000); // First retry
      await vi.advanceTimersByTimeAsync(5 * 60 * 1000); // Second retry

      const result = await sendPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(mockClientInstance.sendMessage).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('should log errors with timestamp and component name', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClientInstance.sendMessage.mockRejectedValue(new Error('Send failed'));

      vi.useFakeTimers();
      const sendPromise = whatsappClient.sendMessage('+1234567890', 'Test');
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
      await sendPromise;
      vi.useRealTimers();

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCalls = consoleErrorSpy.mock.calls.filter((call) =>
        call[0].includes('[WhatsAppClient]')
      );
      expect(errorCalls.length).toBeGreaterThan(0);
    });

    it('should notify user on final failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClientInstance.sendMessage.mockRejectedValue(new Error('Send failed'));

      vi.useFakeTimers();
      const sendPromise = whatsappClient.sendMessage('+1234567890', 'Test');
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
      await sendPromise;
      vi.useRealTimers();

      // Check for critical error notification
      const notificationCall = consoleErrorSpy.mock.calls.find((call) =>
        call[0].includes('[CRITICAL]') && call[0].includes('[WhatsAppClient]')
      );
      expect(notificationCall).toBeDefined();
      expect(notificationCall![0]).toContain('WhatsApp Message Delivery Failed');
    });

    it('should fail if client is not ready', async () => {
      // Create a new client that hasn't been initialized
      const newClient = new WhatsAppClient();
      
      // Use fake timers to avoid waiting for retry delays
      vi.useFakeTimers();
      
      const sendPromise = newClient.sendMessage('+1234567890', 'Test');
      
      // Fast-forward through all retry delays
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
      
      const result = await sendPromise;

      expect(result.success).toBe(false);
      expect(result.error).toContain('not ready');
      
      vi.useRealTimers();
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      mockClientInstance.initialize.mockResolvedValue(undefined);
      mockClientInstance.destroy.mockResolvedValue(undefined);

      await whatsappClient.initialize();
      await whatsappClient.disconnect();

      expect(mockClientInstance.destroy).toHaveBeenCalledTimes(1);
    });

    it('should handle disconnection errors', async () => {
      mockClientInstance.initialize.mockResolvedValue(undefined);
      mockClientInstance.destroy.mockRejectedValue(new Error('Disconnect failed'));

      await whatsappClient.initialize();
      
      await expect(whatsappClient.disconnect()).rejects.toThrow('WhatsApp disconnection failed');
    });

    it('should not throw if client is not initialized', async () => {
      await expect(whatsappClient.disconnect()).resolves.not.toThrow();
    });
  });
});
