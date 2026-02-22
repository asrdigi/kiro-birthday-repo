/**
 * GoogleSheetsClient - Manages Google Sheets API authentication and connection
 * 
 * Implements OAuth 2.0 authentication using credentials from environment variables
 * and provides access to the Google Sheets API for reading friend data.
 * 
 * Requirements: 6.1, 6.4, 6.5
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../utils/logger';

/**
 * GoogleSheetsClient class for authenticating and accessing Google Sheets API
 * 
 * Uses OAuth 2.0 credentials (client ID, client secret, refresh token) from
 * environment variables to authenticate with Google Sheets API.
 */
export class GoogleSheetsClient {
  private oauth2Client: OAuth2Client | null = null;
  private sheetsApi: any = null;
  private sheetId: string;

  /**
   * Creates a new GoogleSheetsClient instance
   * 
   * @param sheetId - The Google Sheet ID to access (optional, defaults to env var)
   */
  constructor(sheetId?: string) {
    this.sheetId = sheetId || process.env.GOOGLE_SHEET_ID || '';
    
    if (!this.sheetId) {
      throw new Error('Google Sheet ID is required. Set GOOGLE_SHEET_ID environment variable.');
    }
  }

  /**
   * Initializes OAuth 2.0 authentication and connects to Google Sheets API
   * 
   * Loads credentials from environment variables:
   * - GOOGLE_CLIENT_ID: OAuth 2.0 client ID
   * - GOOGLE_CLIENT_SECRET: OAuth 2.0 client secret
   * - GOOGLE_REFRESH_TOKEN: OAuth 2.0 refresh token
   * - GOOGLE_REDIRECT_URI: OAuth 2.0 redirect URI (optional, defaults to localhost)
   * 
   * @throws Error if required credentials are missing or authentication fails
   * 
   * Requirements: 6.1, 6.4, 6.5
   */
  async authenticate(): Promise<void> {
    try {
      // Load credentials from environment variables
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

      // Validate required credentials
      if (!clientId) {
        throw new Error('GOOGLE_CLIENT_ID environment variable is required');
      }
      if (!clientSecret) {
        throw new Error('GOOGLE_CLIENT_SECRET environment variable is required');
      }
      if (!refreshToken) {
        throw new Error('GOOGLE_REFRESH_TOKEN environment variable is required');
      }

      // Create OAuth2 client
      this.oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
      );

      // Set credentials with refresh token
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      // Initialize Google Sheets API
      this.sheetsApi = google.sheets({
        version: 'v4',
        auth: this.oauth2Client
      });

      // Verify authentication by making a test request
      await this.verifyConnection();

      logger.info('GoogleSheetsClient', 'Successfully authenticated with Google Sheets API');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.critical('GoogleSheetsClient', 'Authentication failed', { error: errorMessage });
      throw new Error(`Google Sheets authentication failed: ${errorMessage}`);
    }
  }

  /**
   * Verifies the connection to Google Sheets API
   * 
   * Makes a test request to get spreadsheet metadata to ensure
   * authentication is working and the sheet is accessible.
   * 
   * @throws Error if connection verification fails
   * 
   * Requirements: 6.5
   */
  private async verifyConnection(): Promise<void> {
    try {
      if (!this.sheetsApi) {
        throw new Error('Sheets API not initialized');
      }

      // Test connection by getting spreadsheet metadata
      await this.sheetsApi.spreadsheets.get({
        spreadsheetId: this.sheetId
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to verify Google Sheets connection: ${errorMessage}`);
    }
  }

  /**
   * Gets the authenticated Google Sheets API instance
   * 
   * @returns Google Sheets API instance
   * @throws Error if not authenticated
   */
  getSheetsApi(): any {
    if (!this.sheetsApi) {
      throw new Error('Google Sheets API not initialized. Call authenticate() first.');
    }
    return this.sheetsApi;
  }

  /**
   * Gets the configured Google Sheet ID
   * 
   * @returns Google Sheet ID
   */
  getSheetId(): string {
    return this.sheetId;
  }

  /**
   * Checks if the client is authenticated
   * 
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.oauth2Client !== null && this.sheetsApi !== null;
  }
}
