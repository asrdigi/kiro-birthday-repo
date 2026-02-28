/**
 * Validation utilities for friend data
 * 
 * Validates birthdates, phone numbers, and complete friend records
 * according to requirements 1.3, 1.4, and 1.5
 */

import { Friend, ValidationResult } from '../models/types';

/**
 * Validates birthdate format
 * 
 * Accepts the following formats:
 * - YYYY-MM-DD (e.g., "1990-05-15")
 * - DD/MM/YYYY (e.g., "15/05/1990") - PREFERRED FORMAT
 * - DD-MM-YYYY (e.g., "15-05-1990")
 * 
 * @param dateString - The date string to validate
 * @returns true if the date is in a valid format and represents a real date, false otherwise
 * 
 * Requirements: 1.4
 */
export function validateBirthdate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  // Pattern 1: YYYY-MM-DD
  const pattern1 = /^(\d{4})-(\d{2})-(\d{2})$/;
  // Pattern 2: DD/MM/YYYY (with slashes)
  const pattern2 = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  // Pattern 3: DD-MM-YYYY (with dashes)
  const pattern3 = /^(\d{2})-(\d{2})-(\d{4})$/;

  let year: number, month: number, day: number;

  const match1 = dateString.match(pattern1);
  const match2 = dateString.match(pattern2);
  const match3 = dateString.match(pattern3);

  if (match1) {
    // YYYY-MM-DD
    year = parseInt(match1[1], 10);
    month = parseInt(match1[2], 10);
    day = parseInt(match1[3], 10);
  } else if (match2) {
    // DD/MM/YYYY (with slashes)
    day = parseInt(match2[1], 10);
    month = parseInt(match2[2], 10);
    year = parseInt(match2[3], 10);
  } else if (match3) {
    // DD-MM-YYYY (with dashes)
    day = parseInt(match3[1], 10);
    month = parseInt(match3[2], 10);
    year = parseInt(match3[3], 10);
  } else {
    return false;
  }

  // Validate the date is real
  const date = new Date(year, month - 1, day);
  
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Validates E.164 phone number format
 * 
 * E.164 format: ^\+[1-9]\d{1,14}$
 * - Must start with +
 * - First digit after + must be 1-9 (no leading zeros)
 * - Total of 1-14 digits after the +
 * 
 * Examples:
 * - Valid: +1234567890, +919876543210, +34612345678
 * - Invalid: +0123456789 (leading zero), 1234567890 (no +), +123456789012345 (too long)
 * 
 * @param phoneNumber - The phone number to validate
 * @returns true if the phone number matches E.164 format, false otherwise
 * 
 * Requirements: 1.5
 */
export function validateE164PhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false;
  }

  const e164Pattern = /^\+[1-9]\d{1,14}$/;
  return e164Pattern.test(phoneNumber);
}

/**
 * Validates a complete friend record
 * 
 * Checks that all required fields are present and valid:
 * - id: must be a non-empty string
 * - name: must be a non-empty string
 * - birthdate: must be a valid Date object
 * - motherTongue: must be a non-empty string
 * - whatsappNumber: must be in valid E.164 format
 * - country: must be a non-empty string
 * - timezone: must be a non-empty string
 * 
 * @param record - The friend record to validate (partial object)
 * @returns ValidationResult with isValid flag and array of error messages
 * 
 * Requirements: 1.3, 1.4, 1.5
 */
export function validateFriendRecord(record: Partial<Friend>): ValidationResult {
  const errors: string[] = [];

  // Validate id
  if (!record.id || typeof record.id !== 'string' || record.id.trim() === '') {
    errors.push('id is required and must be a non-empty string');
  }

  // Validate name
  if (!record.name || typeof record.name !== 'string' || record.name.trim() === '') {
    errors.push('name is required and must be a non-empty string');
  }

  // Validate birthdate
  if (!record.birthdate || !(record.birthdate instanceof Date) || isNaN(record.birthdate.getTime())) {
    errors.push('birthdate is required and must be a valid Date object');
  }

  // Validate motherTongue
  if (!record.motherTongue || typeof record.motherTongue !== 'string' || record.motherTongue.trim() === '') {
    errors.push('motherTongue is required and must be a non-empty string');
  }

  // Validate whatsappNumber
  if (!record.whatsappNumber || typeof record.whatsappNumber !== 'string') {
    errors.push('whatsappNumber is required and must be a string');
  } else if (!validateE164PhoneNumber(record.whatsappNumber)) {
    errors.push('whatsappNumber must be in valid E.164 format (e.g., +1234567890)');
  }

  // Validate country
  if (!record.country || typeof record.country !== 'string' || record.country.trim() === '') {
    errors.push('country is required and must be a non-empty string');
  }

  // Validate timezone
  if (!record.timezone || typeof record.timezone !== 'string' || record.timezone.trim() === '') {
    errors.push('timezone is required and must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Parses a birthdate string into a Date object
 * 
 * Accepts the same formats as validateBirthdate:
 * - YYYY-MM-DD
 * - DD/MM/YYYY (with slashes) - PREFERRED FORMAT
 * - DD-MM-YYYY (with dashes)
 * 
 * @param dateString - The date string to parse
 * @returns Date object if valid, null if invalid
 */
export function parseBirthdate(dateString: string): Date | null {
  if (!validateBirthdate(dateString)) {
    return null;
  }

  const pattern1 = /^(\d{4})-(\d{2})-(\d{2})$/;
  const pattern2 = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const pattern3 = /^(\d{2})-(\d{2})-(\d{4})$/;

  let year: number, month: number, day: number;

  const match1 = dateString.match(pattern1);
  const match2 = dateString.match(pattern2);
  const match3 = dateString.match(pattern3);

  if (match1) {
    year = parseInt(match1[1], 10);
    month = parseInt(match1[2], 10);
    day = parseInt(match1[3], 10);
  } else if (match2) {
    // DD/MM/YYYY (with slashes)
    day = parseInt(match2[1], 10);
    month = parseInt(match2[2], 10);
    year = parseInt(match2[3], 10);
  } else if (match3) {
    // DD-MM-YYYY (with dashes)
    day = parseInt(match3[1], 10);
    month = parseInt(match3[2], 10);
    year = parseInt(match3[3], 10);
  } else {
    return null;
  }

  return new Date(year, month - 1, day);
}
