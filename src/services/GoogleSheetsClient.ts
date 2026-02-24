/**
 * GoogleSheetsClient - Manages Google Sheets API authentication and connection
 * 
 * Implements Service Account authentication using credentials from environment variables
 * and provides access to the Google Sheets API for reading friend data.
 * 
 * Requirements: 6.1, 6.4, 6.5
 */

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { logger } from '../utils/logger';

/**
 * GoogleSheetsClient class for authenticating and accessing Google Sheets API
 * 
 * Uses Service Account credentials (client email and private key) from
 * environment variables to authenticate with Google Sheets API.
 */
export class GoogleSheetsClient {
  private jwtClient: JWT | null = null;
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
   * Initializes Service Account authentication and connects to Google Sheets API
   * 
   * Loads credentials from environment variables:
   * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email address
   * - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: Service account private key (base64 encoded or raw)
   * 
   * @throws Error if required credentials are missing or authentication fails
   * 
   * Requirements: 6.1, 6.4, 6.5
   */
  async authenticate(): Promise<void> {
    try {
      // Load credentials from environment variables
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

      // Validate required credentials
      if (!serviceAccountEmail) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable is required');
      }
      if (!serviceAccountPrivateKey) {
        throw new Error('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variable is required');
      }

      // Decode private key if it's base64 encoded
      let privateKey = serviceAccountPrivateKey;
      
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // If the key doesn't start with -----BEGIN, try base64 decoding
      if (!privateKey.startsWith('-----BEGIN')) {
        try {
          privateKey = Buffer.from(serviceAccountPrivateKey, 'base64').toString('utf8');
          privateKey = privateKey.replace(/\\n/g, '\n');
        } catch (decodeError) {
          throw new Error('Invalid private key format. Key should be either PEM format or base64 encoded.');
        }
      }

      // Create JWT client for Service Account authentication
      this.jwtClient = new google.auth.JWT(
        serviceAccountEmail,
        undefined,
        privateKey,
        ['https://www.googleapis.com/auth/spreadsheets.readonly']
      );

      // Initialize Google Sheets API
      this.sheetsApi = google.sheets({
        version: 'v4',
        auth: this.jwtClient
      });

      // Verify authentication by making a test request
      await this.verifyConnection();

      logger.info('GoogleSheetsClient', 'Successfully authenticated with Google Sheets API using Service Account');

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
    return this.jwtClient !== null && this.sheetsApi !== null;
  }
}
