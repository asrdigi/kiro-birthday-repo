/**
 * Unit tests for GoogleSheetsClient
 * 
 * Tests OAuth 2.0 authentication, connection verification, and error handling
 * for the Google Sheets API client.
 * 
 * Requirements: 6.1, 6.4, 6.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GoogleSheetsClient } from '../src/services/GoogleSheetsClient';

// Mock the googleapis module
vi.mock('googleapis', () => {
  const mockSheetsApi = {
    spreadsheets: {
      get: vi.fn(),
      values: {
        get: vi.fn()
      }
    }
  };

  const mockOAuth2 = vi.fn().mockImplementation(() => ({
    setCredentials: vi.fn(),
    credentials: {}
  }));

  return {
    google: {
      auth: {
        OAuth2: mockOAuth2
      },
      sheets: vi.fn(() => mockSheetsApi)
    }
  };
});

describe('GoogleSheetsClient', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set up test environment variables
    process.env.GOOGLE_CLIENT_ID = 'test_client_id';
    process.env.GOOGLE_CLIENT_SECRET = 'test_client_secret';
    process.env.GOOGLE_REFRESH_TOKEN = 'test_refresh_token';
    process.env.GOOGLE_SHEET_ID = 'test_sheet_id';
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/oauth2callback';
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should create instance with sheet ID from environment variable', () => {
      const client = new GoogleSheetsClient();
      expect(client.getSheetId()).toBe('test_sheet_id');
    });

    it('should create instance with provided sheet ID', () => {
      const client = new GoogleSheetsClient('custom_sheet_id');
      expect(client.getSheetId()).toBe('custom_sheet_id');
    });

    it('should throw error if sheet ID is not provided and not in environment', () => {
      delete process.env.GOOGLE_SHEET_ID;
      
      expect(() => new GoogleSheetsClient()).toThrow(
        'Google Sheet ID is required. Set GOOGLE_SHEET_ID environment variable.'
      );
    });
  });

  describe('Authentication', () => {
    it('should authenticate successfully with valid credentials', async () => {
      const { google } = await import('googleapis');
      const mockSheetsApi = (google.sheets as any)();
      mockSheetsApi.spreadsheets.get.mockResolvedValue({ data: {} });

      const client = new GoogleSheetsClient();
      await client.authenticate();

      expect(client.isAuthenticated()).toBe(true);
      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        'test_client_id',
        'test_client_secret',
        'http://localhost:3000/oauth2callback'
      );
    });

    it('should throw error if GOOGLE_CLIENT_ID is missing', async () => {
      delete process.env.GOOGLE_CLIENT_ID;

      const client = new GoogleSheetsClient();
      
      await expect(client.authenticate()).rejects.toThrow(
        'Google Sheets authentication failed: GOOGLE_CLIENT_ID environment variable is required'
      );
    });

    it('should throw error if GOOGLE_CLIENT_SECRET is missing', async () => {
      delete process.env.GOOGLE_CLIENT_SECRET;

      const client = new GoogleSheetsClient();
      
      await expect(client.authenticate()).rejects.toThrow(
        'Google Sheets authentication failed: GOOGLE_CLIENT_SECRET environment variable is required'
      );
    });

    it('should throw error if GOOGLE_REFRESH_TOKEN is missing', async () => {
      delete process.env.GOOGLE_REFRESH_TOKEN;

      const client = new GoogleSheetsClient();
      
      await expect(client.authenticate()).rejects.toThrow(
        'Google Sheets authentication failed: GOOGLE_REFRESH_TOKEN environment variable is required'
      );
    });

    it('should use default redirect URI if not provided', async () => {
      delete process.env.GOOGLE_REDIRECT_URI;
      
      const { google } = await import('googleapis');
      const mockSheetsApi = (google.sheets as any)();
      mockSheetsApi.spreadsheets.get.mockResolvedValue({ data: {} });

      const client = new GoogleSheetsClient();
      await client.authenticate();

      expect(google.auth.OAuth2).toHaveBeenCalledWith(
        'test_client_id',
        'test_client_secret',
        'http://localhost:3000/oauth2callback'
      );
    });

    it('should throw error if connection verification fails', async () => {
      const { google } = await import('googleapis');
      const mockSheetsApi = (google.sheets as any)();
      mockSheetsApi.spreadsheets.get.mockRejectedValue(new Error('Permission denied'));

      const client = new GoogleSheetsClient();
      
      await expect(client.authenticate()).rejects.toThrow(
        'Google Sheets authentication failed: Failed to verify Google Sheets connection: Permission denied'
      );
    });
  });

  describe('getSheetsApi', () => {
    it('should return sheets API instance after authentication', async () => {
      const { google } = await import('googleapis');
      const mockSheetsApi = (google.sheets as any)();
      mockSheetsApi.spreadsheets.get.mockResolvedValue({ data: {} });

      const client = new GoogleSheetsClient();
      await client.authenticate();

      const api = client.getSheetsApi();
      expect(api).toBeDefined();
      expect(api.spreadsheets).toBeDefined();
    });

    it('should throw error if not authenticated', () => {
      const client = new GoogleSheetsClient();
      
      expect(() => client.getSheetsApi()).toThrow(
        'Google Sheets API not initialized. Call authenticate() first.'
      );
    });
  });

  describe('isAuthenticated', () => {
    it('should return false before authentication', () => {
      const client = new GoogleSheetsClient();
      expect(client.isAuthenticated()).toBe(false);
    });

    it('should return true after successful authentication', async () => {
      const { google } = await import('googleapis');
      const mockSheetsApi = (google.sheets as any)();
      mockSheetsApi.spreadsheets.get.mockResolvedValue({ data: {} });

      const client = new GoogleSheetsClient();
      await client.authenticate();

      expect(client.isAuthenticated()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      const { google } = await import('googleapis');
      const mockOAuth2 = google.auth.OAuth2 as any;
      mockOAuth2.mockImplementationOnce(() => {
        throw new Error('Invalid credentials');
      });

      const client = new GoogleSheetsClient();
      
      await expect(client.authenticate()).rejects.toThrow(
        'Google Sheets authentication failed'
      );
    });

    it('should handle network errors during verification', async () => {
      const { google } = await import('googleapis');
      const mockSheetsApi = (google.sheets as any)();
      mockSheetsApi.spreadsheets.get.mockRejectedValue(new Error('Network timeout'));

      const client = new GoogleSheetsClient();
      
      await expect(client.authenticate()).rejects.toThrow(
        'Failed to verify Google Sheets connection: Network timeout'
      );
    });
  });
});
