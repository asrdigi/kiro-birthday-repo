/**
 * DataLoader - Fetches and validates friend data from Google Sheets
 * 
 * Implements data loading with 24-hour cache refresh mechanism and
 * validation error logging for invalid friend records.
 * 
 * Requirements: 1.1, 1.2, 1.3, 7.1
 */

import { GoogleSheetsClient } from './GoogleSheetsClient';
import { Friend, ValidationResult } from '../models/types';
import { validateFriendRecord, parseBirthdate } from '../utils/validation';
import { getTimezoneForCountry } from '../utils/timezone';
import { logger } from '../utils/logger';

/**
 * Raw friend data from Google Sheets before parsing
 */
interface RawFriendData {
  name: string;
  birthdate: string;
  motherTongue: string;
  whatsappNumber: string;
  country: string;
}

/**
 * DataLoader class for fetching and validating friend data from Google Sheets
 * 
 * Implements 24-hour cache refresh mechanism and logs validation errors
 * for invalid friend records.
 */
export class DataLoader {
  private googleSheetsClient: GoogleSheetsClient;
  private cachedFriends: Friend[] = [];
  private lastRefreshTime: Date | null = null;
  private readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Creates a new DataLoader instance
   * 
   * @param googleSheetsClient - Authenticated GoogleSheetsClient instance
   */
  constructor(googleSheetsClient: GoogleSheetsClient) {
    this.googleSheetsClient = googleSheetsClient;
  }

  /**
   * Loads all friend records from Google Sheets
   * 
   * Fetches friend data from Google Sheets, validates each record,
   * and returns only valid friends. Invalid records are logged as errors.
   * 
   * Uses 24-hour cache: if data was loaded within the last 24 hours,
   * returns cached data. Otherwise, refreshes from Google Sheets.
   * 
   * @returns Promise<Friend[]> - Array of valid friend records
   * @throws Error if Google Sheets API call fails
   * 
   * Requirements: 1.1, 1.2, 1.3, 7.1
   */
  async loadFriends(): Promise<Friend[]> {
    // Check if cache is still valid (within 24 hours)
    if (this.isCacheValid()) {
      return this.cachedFriends;
    }

    // Refresh cache from Google Sheets
    await this.refreshCache();
    return this.cachedFriends;
  }

  /**
   * Validates a friend record using validation utilities
   * 
   * Checks that all required fields are present and valid according
   * to the validation rules defined in the validation utilities.
   * 
   * @param record - Partial friend record to validate
   * @returns ValidationResult with isValid flag and error messages
   * 
   * Requirements: 1.3
   */
  validateFriend(record: Partial<Friend>): ValidationResult {
    return validateFriendRecord(record);
  }

  /**
   * Refreshes the friend data cache from Google Sheets
   * 
   * Fetches all friend records from Google Sheets, validates each record,
   * and updates the cache with valid friends. Logs validation errors for
   * invalid records.
   * 
   * @throws Error if Google Sheets API call fails
   * 
   * Requirements: 1.1, 1.2, 1.3, 7.1
   */
  async refreshCache(): Promise<void> {
    try {
      // Ensure Google Sheets client is authenticated
      if (!this.googleSheetsClient.isAuthenticated()) {
        throw new Error('Google Sheets client is not authenticated');
      }

      // Fetch data from Google Sheets
      const sheetsApi = this.googleSheetsClient.getSheetsApi();
      const sheetId = this.googleSheetsClient.getSheetId();

      // Read data from the first sheet, assuming headers in row 1
      const response = await sheetsApi.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Sheet1!A2:E', // Assuming columns: Name, Birthdate, Mother Tongue, WhatsApp Number, Country
      });

      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        logger.info('DataLoader', 'No friend data found in Google Sheets');
        this.cachedFriends = [];
        this.lastRefreshTime = new Date();
        return;
      }

      // Parse and validate each row
      const validFriends: Friend[] = [];
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because row 1 is headers and array is 0-indexed

        try {
          const rawFriend = this.parseRawFriendData(row, rowNumber);
          const friend = this.convertToFriend(rawFriend, rowNumber);
          
          // Validate the friend record
          const validationResult = this.validateFriend(friend);
          
          if (validationResult.isValid) {
            validFriends.push(friend);
          } else {
            // Log validation error for invalid record
            this.logValidationError(rowNumber, rawFriend.name || 'Unknown', validationResult.errors);
          }
        } catch (error) {
          // Log parsing error
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logValidationError(rowNumber, row[0] || 'Unknown', [errorMessage]);
        }
      }

      // Update cache
      this.cachedFriends = validFriends;
      this.lastRefreshTime = new Date();

      logger.info('DataLoader', `Successfully loaded ${validFriends.length} valid friend records from Google Sheets`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('DataLoader', 'Failed to refresh friend data from Google Sheets', { error: errorMessage });
      throw new Error(`Failed to refresh friend data from Google Sheets: ${errorMessage}`);
    }
  }

  /**
   * Checks if the cache is still valid (within 24 hours)
   * 
   * @returns true if cache is valid, false if refresh is needed
   */
  private isCacheValid(): boolean {
    if (!this.lastRefreshTime || this.cachedFriends.length === 0) {
      return false;
    }

    const now = new Date();
    const timeSinceRefresh = now.getTime() - this.lastRefreshTime.getTime();
    
    return timeSinceRefresh < this.CACHE_DURATION_MS;
  }

  /**
   * Parses raw row data from Google Sheets into RawFriendData
   * 
   * @param row - Array of cell values from Google Sheets
   * @param rowNumber - Row number for error reporting
   * @returns RawFriendData object
   * @throws Error if row has insufficient columns
   */
  private parseRawFriendData(row: any[], rowNumber: number): RawFriendData {
    if (row.length < 5) {
      throw new Error(`Row ${rowNumber} has insufficient columns (expected 5, got ${row.length})`);
    }

    return {
      name: row[0] || '',
      birthdate: row[1] || '',
      motherTongue: row[2] || '',
      whatsappNumber: row[3] || '',
      country: row[4] || '',
    };
  }

  /**
   * Converts raw friend data to Friend object with parsed birthdate and timezone
   * 
   * @param rawFriend - Raw friend data from Google Sheets
   * @param rowNumber - Row number used as friend ID
   * @returns Friend object
   * @throws Error if birthdate cannot be parsed
   */
  private convertToFriend(rawFriend: RawFriendData, rowNumber: number): Friend {
    // Parse birthdate
    const birthdate = parseBirthdate(rawFriend.birthdate);
    if (!birthdate) {
      throw new Error(`Invalid birthdate format: ${rawFriend.birthdate}`);
    }

    // Map country to timezone using timezone utilities
    const timezone = getTimezoneForCountry(rawFriend.country);

    // Auto-format phone number to E.164 format
    let whatsappNumber = rawFriend.whatsappNumber.trim();
    
    // Debug logging to see the original number
    logger.info('DataLoader', `Processing phone number for ${rawFriend.name}: "${whatsappNumber}" (country: ${rawFriend.country})`);
    
    whatsappNumber = this.formatPhoneNumber(whatsappNumber, rawFriend.country.trim());

    return {
      id: `friend-${rowNumber}`,
      name: rawFriend.name.trim(),
      birthdate,
      motherTongue: rawFriend.motherTongue.trim(),
      whatsappNumber,
      country: rawFriend.country.trim(),
      timezone,
    };
  }

  /**
   * Formats phone number to E.164 format based on country
   * 
   * Automatically adds country code prefix if missing:
   * - India: +91
   * - United States: +1
   * - United Kingdom: +44
   * - And more...
   * 
   * @param phoneNumber - Raw phone number from Google Sheets
   * @param country - Country name
   * @returns Phone number in E.164 format
   */
  /**
     * Formats phone number to E.164 format based on country
     * 
     * Automatically adds country code prefix if missing:
     * - India: +91
     * - United States: +1
     * - United Kingdom: +44
     * - And more...
     * 
     * @param phoneNumber - Raw phone number from Google Sheets
     * @param country - Country name
     * @returns Phone number in E.164 format
     */
    private formatPhoneNumber(phoneNumber: string, country: string): string {
      // If already in E.164 format, return as-is
      if (phoneNumber.startsWith('+')) {
        return phoneNumber;
      }

      // Remove any non-digit characters except +
      let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');

      // Country code mapping
      const countryCodeMap: { [key: string]: string } = {
        'india': '+91',
        'united states': '+1',
        'usa': '+1',
        'us': '+1',
        'united kingdom': '+44',
        'uk': '+44',
        'canada': '+1',
        'australia': '+61',
        'germany': '+49',
        'france': '+33',
        'japan': '+81',
        'china': '+86',
        'brazil': '+55',
        'mexico': '+52',
        'russia': '+7',
        'south korea': '+82',
        'italy': '+39',
        'spain': '+34',
        'netherlands': '+31',
        'sweden': '+46',
        'norway': '+47',
        'denmark': '+45',
        'finland': '+358',
        'switzerland': '+41',
        'austria': '+43',
        'belgium': '+32',
        'portugal': '+351',
        'greece': '+30',
        'turkey': '+90',
        'israel': '+972',
        'south africa': '+27',
        'egypt': '+20',
        'nigeria': '+234',
        'kenya': '+254',
        'ghana': '+233',
        'singapore': '+65',
        'malaysia': '+60',
        'thailand': '+66',
        'philippines': '+63',
        'indonesia': '+62',
        'vietnam': '+84',
        'pakistan': '+92',
        'bangladesh': '+880',
        'sri lanka': '+94',
        'nepal': '+977',
        'myanmar': '+95',
        'afghanistan': '+93',
        'iran': '+98',
        'iraq': '+964',
        'saudi arabia': '+966',
        'uae': '+971',
        'united arab emirates': '+971',
        'qatar': '+974',
        'kuwait': '+965',
        'bahrain': '+973',
        'oman': '+968',
        'jordan': '+962',
        'lebanon': '+961',
        'syria': '+963',
        'yemen': '+967'
      };

      // Get country code
      const countryLower = country.toLowerCase();
      const countryCode = countryCodeMap[countryLower] || '+91'; // Default to India
      const countryCodeDigits = countryCode.substring(1); // Remove the + sign

      // Special handling for Indian numbers
      if (countryLower === 'india') {
        // Indian mobile numbers are typically 10 digits (without country code)
        // If the number is exactly 10 digits, add country code
        if (cleanNumber.length === 10) {
          const result = `${countryCode}${cleanNumber}`;
          logger.info('DataLoader', `Added country code to 10-digit Indian number: ${cleanNumber} -> ${result}`);
          return result;
        }

        // If number starts with 91 and is 12 digits total, it already has country code
        if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
          const result = `+${cleanNumber}`;
          logger.info('DataLoader', `Indian number already has country code: ${cleanNumber} -> ${result}`);
          return result;
        }

        // If number starts with 91 but is only 10 digits, it's missing the country code
        if (cleanNumber.startsWith('91') && cleanNumber.length === 10) {
          const result = `${countryCode}${cleanNumber}`;
          logger.info('DataLoader', `Added country code to Indian number starting with 91: ${cleanNumber} -> ${result}`);
          return result;
        }
      }

      // General logic for other countries
      // Check if the number already starts with the country code (without +)
      if (cleanNumber.startsWith(countryCodeDigits)) {
        // Number already has country code, just add the + prefix
        const result = `+${cleanNumber}`;

        // Validate the final number length (E.164 should be 7-15 digits after +)
        const totalDigits = cleanNumber.length;
        if (totalDigits < 7 || totalDigits > 15) {
          logger.error('DataLoader', `Invalid phone number length for ${cleanNumber}: ${totalDigits} digits (expected 7-15)`);
        }

        return result;
      }

      // Remove leading zeros from the number
      const numberWithoutLeadingZeros = cleanNumber.replace(/^0+/, '');

      // Add country code
      const result = `${countryCode}${numberWithoutLeadingZeros}`;

      // Validate the final number length
      const totalDigits = countryCodeDigits.length + numberWithoutLeadingZeros.length;
      if (totalDigits < 7 || totalDigits > 15) {
        logger.error('DataLoader', `Invalid phone number length for ${result}: ${totalDigits} digits (expected 7-15)`);
      }

      return result;
    }

  /**
   * Logs validation error for an invalid friend record
   * 
   * Logs the error with timestamp, component name, row number, friend name,
   * and detailed error messages.
   * 
   * @param rowNumber - Row number in Google Sheets
   * @param friendName - Name of the friend (if available)
   * @param errors - Array of validation error messages
   * 
   * Requirements: 7.1
   */
  private logValidationError(rowNumber: number, friendName: string, errors: string[]): void {
    logger.error('DataLoader', `Validation error for friend record at row ${rowNumber} (${friendName})`, {
      rowNumber,
      friendName,
      errors
    });
  }

  /**
   * Gets the last refresh time
   * 
   * @returns Date of last refresh, or null if never refreshed
   */
  getLastRefreshTime(): Date | null {
    return this.lastRefreshTime;
  }

  /**
   * Gets the number of cached friends
   * 
   * @returns Number of friends in cache
   */
  getCachedFriendCount(): number {
    return this.cachedFriends.length;
  }
}
