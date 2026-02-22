/**
 * Unit tests for validation utilities
 * 
 * Tests requirements 1.3, 1.4, and 1.5
 */

import { describe, it, expect } from 'vitest';
import {
  validateBirthdate,
  validateE164PhoneNumber,
  validateFriendRecord,
  parseBirthdate
} from '../src/utils/validation';
import { Friend } from '../src/models/types';

describe('validateBirthdate', () => {
  describe('valid formats', () => {
    it('should accept YYYY-MM-DD format', () => {
      expect(validateBirthdate('1990-05-15')).toBe(true);
      expect(validateBirthdate('2000-01-01')).toBe(true);
      expect(validateBirthdate('1985-12-31')).toBe(true);
    });

    it('should accept MM/DD/YYYY format', () => {
      expect(validateBirthdate('05/15/1990')).toBe(true);
      expect(validateBirthdate('01/01/2000')).toBe(true);
      expect(validateBirthdate('12/31/1985')).toBe(true);
    });

    it('should accept DD-MM-YYYY format', () => {
      expect(validateBirthdate('15-05-1990')).toBe(true);
      expect(validateBirthdate('01-01-2000')).toBe(true);
      expect(validateBirthdate('31-12-1985')).toBe(true);
    });
  });

  describe('invalid formats', () => {
    it('should reject invalid date formats', () => {
      expect(validateBirthdate('1990/05/15')).toBe(false);
      expect(validateBirthdate('15.05.1990')).toBe(false);
      expect(validateBirthdate('May 15, 1990')).toBe(false);
      expect(validateBirthdate('1990-5-15')).toBe(false); // Missing leading zero
      expect(validateBirthdate('90-05-15')).toBe(false); // Two-digit year
    });

    it('should reject invalid dates', () => {
      expect(validateBirthdate('1990-13-01')).toBe(false); // Invalid month
      expect(validateBirthdate('1990-02-30')).toBe(false); // Invalid day for February
      expect(validateBirthdate('1990-04-31')).toBe(false); // Invalid day for April
      expect(validateBirthdate('1990-00-15')).toBe(false); // Month 0
      expect(validateBirthdate('1990-05-00')).toBe(false); // Day 0
    });

    it('should reject non-string inputs', () => {
      expect(validateBirthdate('' as any)).toBe(false);
      expect(validateBirthdate(null as any)).toBe(false);
      expect(validateBirthdate(undefined as any)).toBe(false);
      expect(validateBirthdate(123 as any)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle leap years correctly', () => {
      expect(validateBirthdate('2000-02-29')).toBe(true); // Leap year
      expect(validateBirthdate('2001-02-29')).toBe(false); // Not a leap year
      expect(validateBirthdate('1900-02-29')).toBe(false); // Not a leap year (divisible by 100)
      expect(validateBirthdate('2004-02-29')).toBe(true); // Leap year
    });

    it('should handle month boundaries', () => {
      expect(validateBirthdate('1990-01-31')).toBe(true);
      expect(validateBirthdate('1990-03-31')).toBe(true);
      expect(validateBirthdate('1990-04-30')).toBe(true);
      expect(validateBirthdate('1990-06-30')).toBe(true);
    });
  });
});

describe('validateE164PhoneNumber', () => {
  describe('valid E.164 format', () => {
    it('should accept valid E.164 phone numbers', () => {
      expect(validateE164PhoneNumber('+1234567890')).toBe(true);
      expect(validateE164PhoneNumber('+919876543210')).toBe(true);
      expect(validateE164PhoneNumber('+34612345678')).toBe(true);
      expect(validateE164PhoneNumber('+442071234567')).toBe(true);
      expect(validateE164PhoneNumber('+12')).toBe(true); // Minimum length (1-14 digits)
      expect(validateE164PhoneNumber('+123456789012345')).toBe(true); // Maximum length (15 total)
    });
  });

  describe('invalid E.164 format', () => {
    it('should reject numbers without + prefix', () => {
      expect(validateE164PhoneNumber('1234567890')).toBe(false);
      expect(validateE164PhoneNumber('919876543210')).toBe(false);
    });

    it('should reject numbers with leading zero after +', () => {
      expect(validateE164PhoneNumber('+0123456789')).toBe(false);
      expect(validateE164PhoneNumber('+0919876543210')).toBe(false);
    });

    it('should reject numbers that are too long', () => {
      expect(validateE164PhoneNumber('+1234567890123456')).toBe(false); // 16 digits
    });

    it('should reject numbers that are too short', () => {
      expect(validateE164PhoneNumber('+1')).toBe(false); // Only 1 digit
    });

    it('should reject numbers with non-digit characters', () => {
      expect(validateE164PhoneNumber('+123-456-7890')).toBe(false);
      expect(validateE164PhoneNumber('+123 456 7890')).toBe(false);
      expect(validateE164PhoneNumber('+123.456.7890')).toBe(false);
      expect(validateE164PhoneNumber('+123(456)7890')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validateE164PhoneNumber('' as any)).toBe(false);
      expect(validateE164PhoneNumber(null as any)).toBe(false);
      expect(validateE164PhoneNumber(undefined as any)).toBe(false);
      expect(validateE164PhoneNumber(123 as any)).toBe(false);
    });
  });
});

describe('validateFriendRecord', () => {
  const validFriend: Friend = {
    id: '1',
    name: 'John Doe',
    birthdate: new Date('1990-05-15'),
    motherTongue: 'en',
    whatsappNumber: '+1234567890',
    country: 'United States',
    timezone: 'America/New_York'
  };

  describe('valid friend records', () => {
    it('should accept a complete valid friend record', () => {
      const result = validateFriendRecord(validFriend);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('missing required fields', () => {
    it('should reject record with missing id', () => {
      const friend = { ...validFriend, id: '' };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('id is required and must be a non-empty string');
    });

    it('should reject record with missing name', () => {
      const friend = { ...validFriend, name: '' };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name is required and must be a non-empty string');
    });

    it('should reject record with missing birthdate', () => {
      const friend = { ...validFriend, birthdate: undefined as any };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('birthdate is required and must be a valid Date object');
    });

    it('should reject record with invalid birthdate', () => {
      const friend = { ...validFriend, birthdate: new Date('invalid') };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('birthdate is required and must be a valid Date object');
    });

    it('should reject record with missing motherTongue', () => {
      const friend = { ...validFriend, motherTongue: '' };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('motherTongue is required and must be a non-empty string');
    });

    it('should reject record with missing whatsappNumber', () => {
      const friend = { ...validFriend, whatsappNumber: undefined as any };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('whatsappNumber is required and must be a string');
    });

    it('should reject record with invalid whatsappNumber', () => {
      const friend = { ...validFriend, whatsappNumber: '1234567890' }; // Missing +
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('whatsappNumber must be in valid E.164 format (e.g., +1234567890)');
    });

    it('should reject record with missing country', () => {
      const friend = { ...validFriend, country: '' };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('country is required and must be a non-empty string');
    });

    it('should reject record with missing timezone', () => {
      const friend = { ...validFriend, timezone: '' };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('timezone is required and must be a non-empty string');
    });
  });

  describe('multiple validation errors', () => {
    it('should return all validation errors for a completely invalid record', () => {
      const friend: Partial<Friend> = {
        id: '',
        name: '',
        birthdate: undefined,
        motherTongue: '',
        whatsappNumber: 'invalid',
        country: '',
        timezone: ''
      };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });
  });

  describe('whitespace handling', () => {
    it('should reject fields with only whitespace', () => {
      const friend = { ...validFriend, name: '   ' };
      const result = validateFriendRecord(friend);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name is required and must be a non-empty string');
    });
  });
});

describe('parseBirthdate', () => {
  describe('valid date parsing', () => {
    it('should parse YYYY-MM-DD format correctly', () => {
      const date = parseBirthdate('1990-05-15');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(1990);
      expect(date?.getMonth()).toBe(4); // 0-indexed
      expect(date?.getDate()).toBe(15);
    });

    it('should parse MM/DD/YYYY format correctly', () => {
      const date = parseBirthdate('05/15/1990');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(1990);
      expect(date?.getMonth()).toBe(4);
      expect(date?.getDate()).toBe(15);
    });

    it('should parse DD-MM-YYYY format correctly', () => {
      const date = parseBirthdate('15-05-1990');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(1990);
      expect(date?.getMonth()).toBe(4);
      expect(date?.getDate()).toBe(15);
    });
  });

  describe('invalid date parsing', () => {
    it('should return null for invalid formats', () => {
      expect(parseBirthdate('1990/05/15')).toBeNull();
      expect(parseBirthdate('May 15, 1990')).toBeNull();
      expect(parseBirthdate('invalid')).toBeNull();
    });

    it('should return null for invalid dates', () => {
      expect(parseBirthdate('1990-13-01')).toBeNull();
      expect(parseBirthdate('1990-02-30')).toBeNull();
    });
  });
});
