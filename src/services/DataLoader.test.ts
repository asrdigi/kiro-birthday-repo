/**
 * Unit tests for DataLoader class
 * 
 * Tests data loading, validation, caching, and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataLoader } from './DataLoader';
import { GoogleSheetsClient } from './GoogleSheetsClient';
import { Friend } from '../models/types';

describe('DataLoader', () => {
  let mockGoogleSheetsClient: GoogleSheetsClient;
  let dataLoader: DataLoader;
  let mockSheetsApi: any;

  beforeEach(() => {
    // Create mock Google Sheets API
    mockSheetsApi = {
      spreadsheets: {
        values: {
          get: vi.fn(),
        },
      },
    };

    // Create mock GoogleSheetsClient
    mockGoogleSheetsClient = {
      isAuthenticated: vi.fn().mockReturnValue(true),
      getSheetsApi: vi.fn().mockReturnValue(mockSheetsApi),
      getSheetId: vi.fn().mockReturnValue('test-sheet-id'),
    } as any;

    dataLoader = new DataLoader(mockGoogleSheetsClient);
  });

  describe('loadFriends', () => {
    it('should load and return valid friend records from Google Sheets', async () => {
      // Mock Google Sheets response with valid data
      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['John Doe', '1990-05-15', 'en', '+1234567890', 'USA'],
            ['Maria Garcia', '1985-12-25', 'es', '+34612345678', 'Spain'],
          ],
        },
      });

      const friends = await dataLoader.loadFriends();

      expect(friends).toHaveLength(2);
      expect(friends[0].name).toBe('John Doe');
      expect(friends[0].birthdate).toEqual(new Date(1990, 4, 15));
      expect(friends[0].whatsappNumber).toBe('+1234567890');
      expect(friends[1].name).toBe('Maria Garcia');
    });

    it('should skip invalid records and log validation errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock Google Sheets response with one valid and one invalid record
      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['John Doe', '1990-05-15', 'en', '+1234567890', 'USA'],
            ['Invalid Friend', 'invalid-date', 'es', 'invalid-phone', 'Spain'],
          ],
        },
      });

      const friends = await dataLoader.loadFriends();

      // Should only return the valid friend
      expect(friends).toHaveLength(1);
      expect(friends[0].name).toBe('John Doe');

      // Should log validation error for invalid record
      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls.find(call => 
        call[0].includes('Validation error')
      );
      expect(errorCall).toBeDefined();

      consoleErrorSpy.mockRestore();
    });

    it('should return empty array when no data is found', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [],
        },
      });

      const friends = await dataLoader.loadFriends();

      expect(friends).toHaveLength(0);
      // Logger will handle the info message, no need to check console.warn

      consoleWarnSpy.mockRestore();
    });

    it('should throw error if Google Sheets client is not authenticated', async () => {
      (mockGoogleSheetsClient.isAuthenticated as any).mockReturnValue(false);

      await expect(dataLoader.loadFriends()).rejects.toThrow(
        'Google Sheets client is not authenticated'
      );
    });

    it('should throw error if Google Sheets API call fails', async () => {
      mockSheetsApi.spreadsheets.values.get.mockRejectedValue(
        new Error('API error')
      );

      await expect(dataLoader.loadFriends()).rejects.toThrow(
        'Failed to refresh friend data from Google Sheets'
      );
    });
  });

  describe('24-hour cache mechanism', () => {
    it('should cache friends and return cached data within 24 hours', async () => {
      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['John Doe', '1990-05-15', 'en', '+1234567890', 'USA'],
          ],
        },
      });

      // First call - should fetch from API
      const friends1 = await dataLoader.loadFriends();
      expect(mockSheetsApi.spreadsheets.values.get).toHaveBeenCalledTimes(1);

      // Second call - should return cached data
      const friends2 = await dataLoader.loadFriends();
      expect(mockSheetsApi.spreadsheets.values.get).toHaveBeenCalledTimes(1); // Still 1
      expect(friends2).toEqual(friends1);
    });

    it('should refresh cache after 24 hours', async () => {
      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['John Doe', '1990-05-15', 'en', '+1234567890', 'USA'],
          ],
        },
      });

      // First call
      await dataLoader.loadFriends();
      expect(mockSheetsApi.spreadsheets.values.get).toHaveBeenCalledTimes(1);

      // Simulate 24 hours passing by manipulating the last refresh time
      const lastRefreshTime = dataLoader.getLastRefreshTime();
      if (lastRefreshTime) {
        const twentyFiveHoursAgo = new Date(lastRefreshTime.getTime() - 25 * 60 * 60 * 1000);
        (dataLoader as any).lastRefreshTime = twentyFiveHoursAgo;
      }

      // Second call - should refresh from API
      await dataLoader.loadFriends();
      expect(mockSheetsApi.spreadsheets.values.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('validateFriend', () => {
    it('should validate a complete valid friend record', () => {
      const validFriend: Friend = {
        id: 'friend-1',
        name: 'John Doe',
        birthdate: new Date(1990, 4, 15),
        motherTongue: 'en',
        whatsappNumber: '+1234567890',
        country: 'USA',
        timezone: 'America/New_York',
      };

      const result = dataLoader.validateFriend(validFriend);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return validation errors for invalid friend record', () => {
      const invalidFriend: Partial<Friend> = {
        id: '',
        name: 'John Doe',
        // Missing birthdate
        motherTongue: 'en',
        whatsappNumber: 'invalid-phone',
        country: 'USA',
        timezone: 'America/New_York',
      };

      const result = dataLoader.validateFriend(invalidFriend);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
      expect(result.errors.some(e => e.includes('birthdate'))).toBe(true);
      expect(result.errors.some(e => e.includes('whatsappNumber'))).toBe(true);
    });
  });

  describe('refreshCache', () => {
    it('should update last refresh time after successful refresh', async () => {
      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['John Doe', '1990-05-15', 'en', '+1234567890', 'USA'],
          ],
        },
      });

      const beforeRefresh = new Date();
      await dataLoader.loadFriends();
      const afterRefresh = new Date();

      const lastRefreshTime = dataLoader.getLastRefreshTime();
      expect(lastRefreshTime).not.toBeNull();
      expect(lastRefreshTime!.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
      expect(lastRefreshTime!.getTime()).toBeLessThanOrEqual(afterRefresh.getTime());
    });

    it('should update cached friend count', async () => {
      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['John Doe', '1990-05-15', 'en', '+1234567890', 'USA'],
            ['Maria Garcia', '1985-12-25', 'es', '+34612345678', 'Spain'],
          ],
        },
      });

      await dataLoader.loadFriends();

      expect(dataLoader.getCachedFriendCount()).toBe(2);
    });
  });

  describe('error logging', () => {
    it('should log validation errors with timestamp and component name', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Invalid Friend', 'invalid-date', 'es', 'invalid-phone', 'Spain'],
          ],
        },
      });

      await dataLoader.loadFriends();

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCall = consoleErrorSpy.mock.calls[0];
      const errorMessage = errorCall[0];

      // Check that error log contains required components
      expect(errorMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // Timestamp
      expect(errorMessage).toContain('[DataLoader]'); // Component name
      expect(errorMessage).toContain('Validation error'); // Error type
      expect(errorMessage).toContain('row 2'); // Row number

      consoleErrorSpy.mockRestore();
    });
  });

  describe('timezone mapping', () => {
    it('should map recognized countries to correct timezones', async () => {
      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Friend 1', '1990-05-15', 'en', '+1234567890', 'USA'],
            ['Friend 2', '1990-05-15', 'hi', '+919876543210', 'India'],
            ['Friend 3', '1990-05-15', 'es', '+34612345678', 'Spain'],
          ],
        },
      });

      const friends = await dataLoader.loadFriends();

      expect(friends[0].timezone).toBe('America/New_York');
      expect(friends[1].timezone).toBe('Asia/Kolkata');
      expect(friends[2].timezone).toBe('Europe/Madrid');
    });

    it('should default to UTC for unrecognized countries', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: [
            ['Friend 1', '1990-05-15', 'en', '+1234567890', 'UnknownCountry'],
          ],
        },
      });

      const friends = await dataLoader.loadFriends();

      expect(friends[0].timezone).toBe('UTC');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('UnknownCountry')
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
