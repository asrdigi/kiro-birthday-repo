/**
 * Timezone Conversion Utilities
 * 
 * Provides country-to-timezone mapping and local time conversion
 * using the luxon library for robust timezone handling.
 * 
 * Requirements: 2.1, 2.4, 2.5
 */

import { DateTime } from 'luxon';

/**
 * Comprehensive country-to-timezone mapping
 * 
 * Maps country names to IANA timezone identifiers.
 * For countries with multiple timezones, uses the most populous timezone.
 */
const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
  // North America
  'USA': 'America/New_York',
  'United States': 'America/New_York',
  'US': 'America/New_York',
  'Canada': 'America/Toronto',
  'Mexico': 'America/Mexico_City',
  
  // South America
  'Brazil': 'America/Sao_Paulo',
  'Argentina': 'America/Argentina/Buenos_Aires',
  'Chile': 'America/Santiago',
  'Colombia': 'America/Bogota',
  'Peru': 'America/Lima',
  'Venezuela': 'America/Caracas',
  
  // Europe
  'UK': 'Europe/London',
  'United Kingdom': 'Europe/London',
  'England': 'Europe/London',
  'Scotland': 'Europe/London',
  'Wales': 'Europe/London',
  'Ireland': 'Europe/Dublin',
  'France': 'Europe/Paris',
  'Germany': 'Europe/Berlin',
  'Spain': 'Europe/Madrid',
  'Italy': 'Europe/Rome',
  'Portugal': 'Europe/Lisbon',
  'Netherlands': 'Europe/Amsterdam',
  'Belgium': 'Europe/Brussels',
  'Switzerland': 'Europe/Zurich',
  'Austria': 'Europe/Vienna',
  'Poland': 'Europe/Warsaw',
  'Sweden': 'Europe/Stockholm',
  'Norway': 'Europe/Oslo',
  'Denmark': 'Europe/Copenhagen',
  'Finland': 'Europe/Helsinki',
  'Greece': 'Europe/Athens',
  'Russia': 'Europe/Moscow',
  'Turkey': 'Europe/Istanbul',
  
  // Asia
  'India': 'Asia/Kolkata',
  'China': 'Asia/Shanghai',
  'Japan': 'Asia/Tokyo',
  'South Korea': 'Asia/Seoul',
  'Korea': 'Asia/Seoul',
  'Thailand': 'Asia/Bangkok',
  'Vietnam': 'Asia/Ho_Chi_Minh',
  'Singapore': 'Asia/Singapore',
  'Malaysia': 'Asia/Kuala_Lumpur',
  'Indonesia': 'Asia/Jakarta',
  'Philippines': 'Asia/Manila',
  'Pakistan': 'Asia/Karachi',
  'Bangladesh': 'Asia/Dhaka',
  'Sri Lanka': 'Asia/Colombo',
  'Nepal': 'Asia/Kathmandu',
  'UAE': 'Asia/Dubai',
  'United Arab Emirates': 'Asia/Dubai',
  'Saudi Arabia': 'Asia/Riyadh',
  'Israel': 'Asia/Jerusalem',
  'Hong Kong': 'Asia/Hong_Kong',
  'Taiwan': 'Asia/Taipei',
  
  // Oceania
  'Australia': 'Australia/Sydney',
  'New Zealand': 'Pacific/Auckland',
  
  // Africa
  'South Africa': 'Africa/Johannesburg',
  'Egypt': 'Africa/Cairo',
  'Nigeria': 'Africa/Lagos',
  'Kenya': 'Africa/Nairobi',
  'Morocco': 'Africa/Casablanca',
  'Ethiopia': 'Africa/Addis_Ababa',
  'Ghana': 'Africa/Accra',
  'Tanzania': 'Africa/Dar_es_Salaam',
  'Uganda': 'Africa/Kampala',
  'Algeria': 'Africa/Algiers',
};

/**
 * Gets the IANA timezone identifier for a given country
 * 
 * Performs case-insensitive lookup of country name in the timezone map.
 * If the country is not recognized, logs an error and returns 'UTC'.
 * 
 * @param country - Country name (case-insensitive)
 * @returns IANA timezone identifier (e.g., 'America/New_York', 'Asia/Kolkata')
 * 
 * Requirements: 2.1, 2.4, 2.5
 */
export function getTimezoneForCountry(country: string): string {
  // Normalize country name: trim whitespace and convert to title case for lookup
  const normalizedCountry = country.trim();
  
  // Try exact match first (case-sensitive)
  if (COUNTRY_TIMEZONE_MAP[normalizedCountry]) {
    return COUNTRY_TIMEZONE_MAP[normalizedCountry];
  }
  
  // Try case-insensitive match
  const countryLower = normalizedCountry.toLowerCase();
  for (const [key, timezone] of Object.entries(COUNTRY_TIMEZONE_MAP)) {
    if (key.toLowerCase() === countryLower) {
      return timezone;
    }
  }
  
  // Country not recognized - log error and return UTC
  const timestamp = new Date().toISOString();
  console.error(
    `[${timestamp}] [TimezoneUtils] Unrecognized country: '${country}'. Defaulting to UTC timezone.`
  );
  
  return 'UTC';
}

/**
 * Gets the current local time for a given country
 * 
 * Converts the current UTC time to the local time in the specified country's timezone.
 * Uses luxon's DateTime for accurate timezone conversion.
 * 
 * @param country - Country name
 * @returns DateTime object representing the current local time in the country's timezone
 * 
 * Requirements: 2.1, 2.4
 */
export function getLocalTimeForCountry(country: string): DateTime {
  const timezone = getTimezoneForCountry(country);
  return DateTime.now().setZone(timezone);
}

/**
 * Gets the local time for a given country at a specific UTC timestamp
 * 
 * Converts a specific UTC timestamp to the local time in the specified country's timezone.
 * Useful for testing and for converting historical timestamps.
 * 
 * @param country - Country name
 * @param utcTimestamp - UTC timestamp (Date object or ISO string)
 * @returns DateTime object representing the local time in the country's timezone
 * 
 * Requirements: 2.1, 2.4
 */
export function getLocalTimeForCountryAtTimestamp(
  country: string,
  utcTimestamp: Date | string
): DateTime {
  const timezone = getTimezoneForCountry(country);
  const dateTime = typeof utcTimestamp === 'string' 
    ? DateTime.fromISO(utcTimestamp, { zone: 'utc' })
    : DateTime.fromJSDate(utcTimestamp, { zone: 'utc' });
  
  return dateTime.setZone(timezone);
}

/**
 * Checks if a given date matches today in the specified country's timezone
 * 
 * Compares the month and day of the given birthdate with today's date
 * in the country's local timezone.
 * 
 * @param birthdate - Date object representing the birthdate
 * @param country - Country name
 * @returns true if today is the birthday in the country's local timezone
 * 
 * Requirements: 2.2, 2.3
 */
export function isBirthdayToday(birthdate: Date, country: string): boolean {
  const localTime = getLocalTimeForCountry(country);
  
  // Extract month and day from birthdate
  const birthdateMonth = birthdate.getMonth() + 1; // getMonth() is 0-indexed
  const birthdateDay = birthdate.getDate();
  
  // Compare with local time's month and day
  return localTime.month === birthdateMonth && localTime.day === birthdateDay;
}

/**
 * Gets all supported countries
 * 
 * Returns an array of all country names that have timezone mappings.
 * Useful for validation and testing.
 * 
 * @returns Array of supported country names
 */
export function getSupportedCountries(): string[] {
  return Object.keys(COUNTRY_TIMEZONE_MAP);
}
