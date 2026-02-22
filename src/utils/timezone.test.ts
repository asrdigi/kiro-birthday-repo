/**
 * Tests for Timezone Conversion Utilities
 * 
 * Tests country-to-timezone mapping, local time conversion,
 * and error handling for unrecognized countries.
 * 
 * Requirements: 2.1, 2.4, 2.5
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DateTime } from 'luxon';
import {
  getTimezoneForCountry,
  getLocalTimeForCountry,
  getLocalTimeForCountryAtTimestamp,
  isBirthdayToday,
  getSupportedCountries
} from './timezone';

describe('Timezone Conversion Utilities', () => {
  describe('getTimezoneForCountry', () => {
    test('should return correct timezone for USA', () => {
      expect(getTimezoneForCountry('USA')).toBe('America/New_York');
      expect(getTimezoneForCountry('United States')).toBe('America/New_York');
      expect(getTimezoneForCountry('US')).toBe('America/New_York');
    });

    test('should return correct timezone for India', () => {
      expect(getTimezoneForCountry('India')).toBe('Asia/Kolkata');
    });

    test('should return correct timezone for European countries', () => {
      expect(getTimezoneForCountry('UK')).toBe('Europe/London');
      expect(getTimezoneForCountry('United Kingdom')).toBe('Europe/London');
      expect(getTimezoneForCountry('France')).toBe('Europe/Paris');
      expect(getTimezoneForCountry('Germany')).toBe('Europe/Berlin');
      expect(getTimezoneForCountry('Spain')).toBe('Europe/Madrid');
      expect(getTimezoneForCountry('Italy')).toBe('Europe/Rome');
    });

    test('should return correct timezone for Asian countries', () => {
      expect(getTimezoneForCountry('Japan')).toBe('Asia/Tokyo');
      expect(getTimezoneForCountry('China')).toBe('Asia/Shanghai');
      expect(getTimezoneForCountry('Singapore')).toBe('Asia/Singapore');
      expect(getTimezoneForCountry('Thailand')).toBe('Asia/Bangkok');
    });

    test('should return correct timezone for South American countries', () => {
      expect(getTimezoneForCountry('Brazil')).toBe('America/Sao_Paulo');
      expect(getTimezoneForCountry('Argentina')).toBe('America/Argentina/Buenos_Aires');
      expect(getTimezoneForCountry('Chile')).toBe('America/Santiago');
    });

    test('should return correct timezone for Oceania countries', () => {
      expect(getTimezoneForCountry('Australia')).toBe('Australia/Sydney');
      expect(getTimezoneForCountry('New Zealand')).toBe('Pacific/Auckland');
    });

    test('should handle case-insensitive country names', () => {
      expect(getTimezoneForCountry('usa')).toBe('America/New_York');
      expect(getTimezoneForCountry('INDIA')).toBe('Asia/Kolkata');
      expect(getTimezoneForCountry('SpAiN')).toBe('Europe/Madrid');
    });

    test('should handle country names with extra whitespace', () => {
      expect(getTimezoneForCountry('  USA  ')).toBe('America/New_York');
      expect(getTimezoneForCountry(' India ')).toBe('Asia/Kolkata');
    });

    test('should return UTC for unrecognized countries', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(getTimezoneForCountry('UnknownCountry')).toBe('UTC');
      expect(getTimezoneForCountry('Atlantis')).toBe('UTC');
      expect(getTimezoneForCountry('')).toBe('UTC');
      
      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('Unrecognized country');
      
      consoleSpy.mockRestore();
    });

    test('should log error with timestamp and component name for unrecognized countries', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      getTimezoneForCountry('Narnia');
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const errorMessage = consoleSpy.mock.calls[0][0];
      expect(errorMessage).toContain('[TimezoneUtils]');
      expect(errorMessage).toContain('Unrecognized country');
      expect(errorMessage).toContain('Narnia');
      expect(errorMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO timestamp
      
      consoleSpy.mockRestore();
    });
  });

  describe('getLocalTimeForCountry', () => {
    test('should return DateTime object for valid country', () => {
      const localTime = getLocalTimeForCountry('USA');
      
      expect(localTime).toBeInstanceOf(DateTime);
      expect(localTime.zoneName).toBe('America/New_York');
      expect(localTime.isValid).toBe(true);
    });

    test('should return different times for different timezones', () => {
      const usTime = getLocalTimeForCountry('USA');
      const indiaTime = getLocalTimeForCountry('India');
      
      // Times should be different (unless by coincidence they're the same hour)
      // More importantly, the zones should be different
      expect(usTime.zoneName).not.toBe(indiaTime.zoneName);
    });

    test('should return UTC time for unrecognized countries', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const localTime = getLocalTimeForCountry('UnknownCountry');
      
      expect(localTime.zoneName).toBe('UTC');
      expect(localTime.isValid).toBe(true);
      
      consoleSpy.mockRestore();
    });

    test('should return current time', () => {
      const beforeCall = DateTime.now();
      const localTime = getLocalTimeForCountry('USA');
      const afterCall = DateTime.now();
      
      // Local time should be between before and after (within a few seconds)
      const diffBefore = localTime.diff(beforeCall, 'seconds').seconds;
      const diffAfter = afterCall.diff(localTime, 'seconds').seconds;
      
      expect(diffBefore).toBeGreaterThanOrEqual(0);
      expect(diffAfter).toBeGreaterThanOrEqual(0);
      expect(diffBefore).toBeLessThan(5); // Should be within 5 seconds
      expect(diffAfter).toBeLessThan(5);
    });
  });

  describe('getLocalTimeForCountryAtTimestamp', () => {
    test('should convert Date object to local time', () => {
      const utcDate = new Date('2024-01-15T12:00:00Z');
      const localTime = getLocalTimeForCountryAtTimestamp('USA', utcDate);
      
      expect(localTime).toBeInstanceOf(DateTime);
      expect(localTime.zoneName).toBe('America/New_York');
      expect(localTime.isValid).toBe(true);
    });

    test('should convert ISO string to local time', () => {
      const isoString = '2024-01-15T12:00:00Z';
      const localTime = getLocalTimeForCountryAtTimestamp('India', isoString);
      
      expect(localTime).toBeInstanceOf(DateTime);
      expect(localTime.zoneName).toBe('Asia/Kolkata');
      expect(localTime.isValid).toBe(true);
    });

    test('should correctly convert UTC noon to different timezones', () => {
      const utcNoon = new Date('2024-01-15T12:00:00Z');
      
      const usTime = getLocalTimeForCountryAtTimestamp('USA', utcNoon);
      const indiaTime = getLocalTimeForCountryAtTimestamp('India', utcNoon);
      
      // USA Eastern Time is UTC-5 (or UTC-4 during DST)
      // India is UTC+5:30
      // So they should be different hours
      expect(usTime.hour).not.toBe(indiaTime.hour);
    });

    test('should preserve the date when converting', () => {
      const utcDate = new Date('2024-06-15T12:00:00Z');
      const localTime = getLocalTimeForCountryAtTimestamp('Japan', utcDate);
      
      // Japan is UTC+9, so 12:00 UTC becomes 21:00 same day
      expect(localTime.year).toBe(2024);
      expect(localTime.month).toBe(6);
      expect(localTime.day).toBe(15);
      expect(localTime.hour).toBe(21);
    });
  });

  describe('isBirthdayToday', () => {
    test('should return true when birthdate matches today in local timezone', () => {
      // Get current date in India timezone
      const indiaTime = DateTime.now().setZone('Asia/Kolkata');
      
      // Create a birthdate with same month and day but different year
      const birthdate = new Date(1990, indiaTime.month - 1, indiaTime.day);
      
      const result = isBirthdayToday(birthdate, 'India');
      expect(result).toBe(true);
    });

    test('should return false when birthdate does not match today', () => {
      // Get current date in USA timezone
      const usTime = DateTime.now().setZone('America/New_York');
      
      // Create a birthdate with different month
      const differentMonth = usTime.month === 12 ? 1 : usTime.month + 1;
      const birthdate = new Date(1990, differentMonth - 1, usTime.day);
      
      const result = isBirthdayToday(birthdate, 'USA');
      expect(result).toBe(false);
    });

    test('should return false when day matches but month does not', () => {
      const usTime = DateTime.now().setZone('America/New_York');
      
      // Same day, different month
      const differentMonth = usTime.month === 12 ? 1 : usTime.month + 1;
      const birthdate = new Date(1990, differentMonth - 1, usTime.day);
      
      const result = isBirthdayToday(birthdate, 'USA');
      expect(result).toBe(false);
    });

    test('should return false when month matches but day does not', () => {
      const usTime = DateTime.now().setZone('America/New_York');
      
      // Same month, different day
      const differentDay = usTime.day === 1 ? 15 : 1;
      const birthdate = new Date(1990, usTime.month - 1, differentDay);
      
      const result = isBirthdayToday(birthdate, 'USA');
      expect(result).toBe(false);
    });

    test('should handle leap year birthdays', () => {
      // Create a Feb 29 birthdate
      const leapYearBirthdate = new Date(1992, 1, 29); // Feb 29, 1992
      
      const usTime = DateTime.now().setZone('America/New_York');
      
      // If today is Feb 29, should return true
      // Otherwise should return false
      const result = isBirthdayToday(leapYearBirthdate, 'USA');
      
      if (usTime.month === 2 && usTime.day === 29) {
        expect(result).toBe(true);
      } else {
        expect(result).toBe(false);
      }
    });

    test('should work with different timezones', () => {
      // This test verifies that the function uses the correct timezone
      const japanTime = DateTime.now().setZone('Asia/Tokyo');
      const birthdate = new Date(1985, japanTime.month - 1, japanTime.day);
      
      const result = isBirthdayToday(birthdate, 'Japan');
      expect(result).toBe(true);
    });

    test('should handle unrecognized countries by using UTC', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const utcTime = DateTime.now().setZone('UTC');
      const birthdate = new Date(1990, utcTime.month - 1, utcTime.day);
      
      const result = isBirthdayToday(birthdate, 'UnknownCountry');
      expect(result).toBe(true); // Should use UTC and match
      
      consoleSpy.mockRestore();
    });
  });

  describe('getSupportedCountries', () => {
    test('should return an array of country names', () => {
      const countries = getSupportedCountries();
      
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    test('should include major countries', () => {
      const countries = getSupportedCountries();
      
      expect(countries).toContain('USA');
      expect(countries).toContain('India');
      expect(countries).toContain('UK');
      expect(countries).toContain('Japan');
      expect(countries).toContain('Australia');
      expect(countries).toContain('Brazil');
    });

    test('should return unique country names', () => {
      const countries = getSupportedCountries();
      const uniqueCountries = [...new Set(countries)];
      
      expect(countries.length).toBe(uniqueCountries.length);
    });

    test('should have at least 50 countries', () => {
      const countries = getSupportedCountries();
      
      // We have a comprehensive mapping, should have many countries
      expect(countries.length).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string country name', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const timezone = getTimezoneForCountry('');
      expect(timezone).toBe('UTC');
      
      consoleSpy.mockRestore();
    });

    test('should handle country names with special characters', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const timezone = getTimezoneForCountry('São Tomé');
      expect(timezone).toBe('UTC'); // Not in our map, should default to UTC
      
      consoleSpy.mockRestore();
    });

    test('should handle very long country names', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const longName = 'A'.repeat(1000);
      const timezone = getTimezoneForCountry(longName);
      expect(timezone).toBe('UTC');
      
      consoleSpy.mockRestore();
    });

    test('should handle birthdate at year boundaries', () => {
      // Test Jan 1 - only if today is actually Jan 1
      const usTime = DateTime.now().setZone('America/New_York');
      
      if (usTime.month === 1 && usTime.day === 1) {
        const jan1Birthdate = new Date(1990, 0, 1);
        expect(isBirthdayToday(jan1Birthdate, 'USA')).toBe(true);
      }
      
      // Test Dec 31 - only if today is actually Dec 31
      if (usTime.month === 12 && usTime.day === 31) {
        const dec31Birthdate = new Date(1990, 11, 31);
        expect(isBirthdayToday(dec31Birthdate, 'USA')).toBe(true);
      }
      
      // If neither condition is met, just verify the function works
      // with a birthdate that matches today
      const todayBirthdate = new Date(1990, usTime.month - 1, usTime.day);
      expect(isBirthdayToday(todayBirthdate, 'USA')).toBe(true);
    });
  });

  describe('Integration with DataLoader', () => {
    test('should provide timezone that DataLoader can use', () => {
      // Simulate what DataLoader does
      const country = 'Spain';
      const timezone = getTimezoneForCountry(country);
      
      expect(timezone).toBe('Europe/Madrid');
      
      // Verify it's a valid IANA timezone
      const dt = DateTime.now().setZone(timezone);
      expect(dt.isValid).toBe(true);
    });

    test('should handle all common countries DataLoader might encounter', () => {
      const commonCountries = [
        'USA', 'United States', 'India', 'UK', 'United Kingdom',
        'Canada', 'Australia', 'Germany', 'France', 'Japan',
        'China', 'Brazil', 'Mexico', 'Spain', 'Italy'
      ];
      
      for (const country of commonCountries) {
        const timezone = getTimezoneForCountry(country);
        expect(timezone).not.toBe('UTC'); // All should have specific timezones
        
        // Verify timezone is valid
        const dt = DateTime.now().setZone(timezone);
        expect(dt.isValid).toBe(true);
      }
    });
  });
});
