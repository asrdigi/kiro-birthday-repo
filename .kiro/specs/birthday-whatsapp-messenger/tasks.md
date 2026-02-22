# Implementation Plan: Automated Birthday WhatsApp Messaging System

## Overview

This implementation plan breaks down the birthday messaging system into discrete coding tasks. The system will be built using Node.js with TypeScript, integrating Google Sheets API, OpenAI ChatGPT API, and whatsapp-web.js for WhatsApp messaging. The scheduler runs once daily at 4 AM IST using node-cron, checking all friends and sending messages to those whose birthday is today in their local timezone. The implementation follows an incremental approach, building core components first, then integrating them into the complete workflow.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Initialize Node.js project with TypeScript configuration
  - Install dependencies: googleapis, openai, whatsapp-web.js, luxon, better-sqlite3, dotenv, node-cron
  - Create directory structure: src/, src/services/, src/models/, src/utils/, tests/
  - Set up TypeScript compiler configuration
  - Create .env.example file with required environment variables
  - _Requirements: 6.4_

- [ ] 2. Implement data models and validation
  - [x] 2.1 Create core data model interfaces and types
    - Define Friend interface with all required fields
    - Define SentMessageRecord interface
    - Define BirthdayEvent interface
    - Define DeliveryResult interface
    - Define ValidationResult type
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Implement validation utilities
    - Write birthdate format validator (YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY)
    - Write E.164 phone number validator
    - Write friend record validator that checks all required fields
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ]* 2.3 Write property test for date format validation
    - **Property 3: Date format validation**
    - **Validates: Requirements 1.4**

  - [ ]* 2.4 Write property test for E.164 phone number validation
    - **Property 4: E.164 phone number validation**
    - **Validates: Requirements 1.5**

  - [ ]* 2.5 Write unit tests for validation utilities
    - Test specific valid and invalid date formats
    - Test specific valid and invalid phone numbers
    - Test edge cases for friend record validation
    - _Requirements: 1.3, 1.4, 1.5_

- [ ] 3. Implement State Manager with SQLite
  - [x] 3.1 Create SQLite database schema and connection
    - Define sent_messages table schema
    - Create database initialization function
    - Implement connection management
    - _Requirements: 5.1, 5.4_

  - [x] 3.2 Implement StateManager class
    - Write recordSentMessage() method
    - Write wasMessageSent() method
    - Write getDeliveryHistory() method
    - Add error handling for database operations
    - _Requirements: 4.5, 5.1, 5.2, 5.3_

  - [ ]* 3.3 Write property test for sent message persistence
    - **Property 12: Sent message persistence**
    - **Validates: Requirements 4.5, 5.1**

  - [ ]* 3.4 Write property test for duplicate message detection
    - **Property 13: Duplicate message detection**
    - **Validates: Requirements 5.2**

  - [ ]* 3.5 Write property test for persistence across restarts
    - **Property 15: Persistence across restarts**
    - **Validates: Requirements 5.4, 8.4**

  - [ ]* 3.6 Write unit tests for StateManager
    - Test database initialization
    - Test recording messages with various statuses
    - Test duplicate detection logic
    - Test error handling for database failures
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Data Loader for Google Sheets
  - [x] 5.1 Create Google Sheets API client
    - Implement OAuth 2.0 authentication using credentials from environment
    - Create connection to Google Sheets API
    - Add authentication error handling
    - _Requirements: 6.1, 6.4, 6.5_

  - [x] 5.2 Implement DataLoader class
    - Write loadFriends() method to fetch all friend records
    - Write validateFriend() method using validation utilities
    - Implement 24-hour cache refresh mechanism
    - Add error logging for invalid records
    - _Requirements: 1.1, 1.2, 1.3, 7.1_

  - [ ]* 5.3 Write property test for friend data reading completeness
    - **Property 1: Friend data reading completeness**
    - **Validates: Requirements 1.2**

  - [ ]* 5.4 Write property test for validation error logging
    - **Property 2: Validation error logging for incomplete records**
    - **Validates: Requirements 1.3**

  - [ ]* 5.5 Write property test for credential loading
    - **Property 16: Credential loading from environment**
    - **Validates: Requirements 6.4**

  - [ ]* 5.6 Write property test for authentication failure handling
    - **Property 17: Authentication failure handling**
    - **Validates: Requirements 6.5**

  - [ ]* 5.7 Write unit tests for DataLoader
    - Test with mock Google Sheets API responses
    - Test validation error logging for specific invalid records
    - Test cache refresh timing
    - Test authentication failure scenarios
    - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.5_

- [ ] 6. Implement timezone and birthday detection utilities
  - [x] 6.1 Create timezone conversion utilities
    - Implement country-to-timezone mapping using luxon
    - Write function to get local time for a given country
    - Add error handling for unrecognized countries
    - _Requirements: 2.1, 2.4, 2.5_

  - [x] 6.2 Implement birthday detection logic
    - Write function to check if today is the friend's birthday in their local timezone
    - Handle edge cases (leap years, timezone boundaries)
    - _Requirements: 2.2_

  - [ ]* 6.3 Write property test for timezone conversion correctness
    - **Property 5: Timezone conversion correctness**
    - **Validates: Requirements 2.1, 2.4**

  - [ ]* 6.4 Write property test for birthday detection in local timezone
    - **Property 6: Birthday detection in friend's local timezone**
    - **Validates: Requirements 2.2**

  - [ ]* 6.5 Write unit tests for timezone and birthday utilities
    - Test specific timezone conversions (US, India, Spain, etc.)
    - Test birthday detection with specific dates and times
    - Test edge cases (leap years, DST transitions)
    - _Requirements: 2.1, 2.2, 2.4_

- [ ] 7. Implement Message Generator with ChatGPT
  - [x] 7.1 Create OpenAI API client
    - Implement authentication using API key from environment
    - Create connection to OpenAI API
    - Add authentication error handling
    - _Requirements: 6.2, 6.4, 6.5_

  - [x] 7.2 Implement MessageGenerator class
    - Write generateMessage() method with structured prompt
    - Implement retryWithBackoff() with exponential backoff (1s, 2s, 4s)
    - Add error logging and user notification on final failure
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.1, 7.4_

  - [ ]* 7.3 Write property test for message generation in target language
    - **Property 7: Message generation in target language**
    - **Validates: Requirements 3.1**

  - [ ]* 7.4 Write property test for friend name inclusion
    - **Property 8: Friend name inclusion in messages**
    - **Validates: Requirements 3.2**

  - [ ]* 7.5 Write property test for ChatGPT retry with exponential backoff
    - **Property 9: ChatGPT API retry with exponential backoff**
    - **Validates: Requirements 3.4**

  - [ ]* 7.6 Write unit tests for MessageGenerator
    - Test with mock ChatGPT API responses
    - Test retry logic with simulated failures
    - Test error notification on final failure
    - Test prompt structure and language parameter
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [~] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement WhatsApp Client
  - [x] 9.1 Create WhatsApp client with whatsapp-web.js
    - Implement initialize() method with QR code authentication
    - Implement session persistence in .wwebjs_auth/ directory
    - Implement connection status monitoring
    - Add authentication error handling
    - _Requirements: 6.3, 6.4, 6.5_

  - [x] 9.2 Implement message sending with retry logic
    - Write sendMessage() method
    - Implement retry logic with 3 attempts and 5-minute intervals
    - Write isReady() and disconnect() methods
    - Add error logging and user notification on final failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.4_

  - [ ]* 9.3 Write property test for message delivery attempt
    - **Property 10: Message delivery attempt**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 9.4 Write property test for WhatsApp delivery retry logic
    - **Property 11: WhatsApp delivery retry logic**
    - **Validates: Requirements 4.3**

  - [ ]* 9.5 Write unit tests for WhatsAppClient
    - Test with mock whatsapp-web.js client
    - Test session persistence
    - Test retry logic with simulated failures
    - Test connection status monitoring
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.3_

- [ ] 10. Implement logging infrastructure
  - [x] 10.1 Create logging utility
    - Implement structured logging with timestamp, component name, and details
    - Add log levels (info, error, critical)
    - Implement log persistence (file or console)
    - Add 90-day log retention mechanism
    - _Requirements: 7.1, 7.2, 7.3, 7.5_

  - [x] 10.2 Integrate logging into all components
    - Add error logging to all error handlers
    - Add success logging for message deliveries
    - Add birthday event logging to scheduler
    - Add critical error notifications
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 10.3 Write property test for error log structure
    - **Property 18: Error log structure**
    - **Validates: Requirements 7.1**

  - [ ]* 10.4 Write property test for success delivery logging
    - **Property 19: Success delivery logging**
    - **Validates: Requirements 7.2**

  - [ ]* 10.5 Write property test for birthday event logging
    - **Property 20: Birthday event logging**
    - **Validates: Requirements 7.3**

  - [ ]* 10.6 Write property test for critical error notifications
    - **Property 21: Critical error notifications**
    - **Validates: Requirements 7.4**

  - [ ]* 10.7 Write unit tests for logging utility
    - Test log formatting with various inputs
    - Test log persistence
    - Test notification triggering for critical errors
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 11. Implement Scheduler Service
  - [x] 11.1 Create Scheduler class structure
    - Define Scheduler class with dependencies (DataLoader, MessageGenerator, WhatsAppClient, StateManager)
    - Install and configure node-cron for scheduling
    - Implement start() method to initialize and schedule daily execution at 4 AM IST
    - _Requirements: 8.1, 8.2_

  - [x] 11.2 Implement birthday checking workflow
    - Write checkBirthdays() method to evaluate all friends
    - Use timezone utilities to determine local date for each friend
    - Use birthday detection logic to identify friends whose birthday is today in their timezone
    - Log detected birthday events
    - _Requirements: 2.2, 2.3, 7.3_

  - [x] 11.3 Implement birthday processing workflow
    - Write processBirthday(friend) method
    - Check if message already sent this year (duplicate prevention)
    - Generate birthday message using MessageGenerator
    - Send message using WhatsAppClient
    - Record sent message using StateManager
    - Log success or failure
    - _Requirements: 3.1, 4.1, 4.5, 5.2, 5.3, 7.2_

  - [x] 11.4 Implement startup validation
    - Validate all API connections on startup
    - Halt execution if any authentication fails
    - Log startup status
    - _Requirements: 8.3_

  - [x] 11.5 Implement data refresh mechanism
    - Trigger DataLoader.refreshCache() every 24 hours
    - Log data refresh events
    - _Requirements: 8.5_

  - [ ]* 11.6 Write property test for duplicate message prevention
    - **Property 14: Duplicate message prevention**
    - **Validates: Requirements 5.3**

  - [ ]* 11.7 Write unit tests for Scheduler
    - Test checkBirthdays() with mock friend data
    - Test processBirthday() workflow with mocks
    - Test duplicate prevention logic
    - Test startup validation
    - Test cron schedule configuration (4 AM IST)
    - _Requirements: 2.2, 2.3, 5.2, 5.3, 8.1, 8.2, 8.3, 8.5_

- [~] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Create main application entry point
  - [x] 13.1 Create main.ts file
    - Load environment variables using dotenv
    - Initialize all services (DataLoader, MessageGenerator, WhatsAppClient, StateManager, Scheduler)
    - Start the Scheduler
    - Add graceful shutdown handling
    - _Requirements: 6.4, 8.1, 8.3_

  - [x] 13.2 Create environment configuration
    - Document all required environment variables in .env.example
    - Add validation for required environment variables on startup
    - _Requirements: 6.4_

  - [ ]* 13.3 Write integration test for complete birthday flow
    - Test end-to-end: Load data → Detect birthday → Generate message → Send message → Record delivery
    - Use mocks for all external APIs
    - _Requirements: 1.1, 2.2, 3.1, 4.1, 4.5_

  - [ ]* 13.4 Write integration test for duplicate prevention across restart
    - Test: Send message → Simulate restart → Attempt to send again → Verify skipped
    - _Requirements: 5.3, 5.4, 8.4_

- [ ] 14. Create documentation and setup instructions
  - [~] 14.1 Create README.md
    - Document system overview and architecture
    - Provide setup instructions (dependencies, environment variables)
    - Document Google Sheets format and required columns
    - Provide instructions for WhatsApp QR code authentication
    - Document how to run the application
    - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4_

  - [~] 14.2 Create deployment guide
    - Document how to run as a continuous process
    - Provide instructions for process management (PM2, systemd, Docker)
    - Document log file locations and monitoring
    - _Requirements: 8.1, 7.5_

- [~] 15. Final checkpoint - Ensure all tests pass and system is ready
  - Run all unit tests and property-based tests
  - Verify all environment variables are documented
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All external API calls should be mocked in tests to avoid actual API usage
- The system uses TypeScript for type safety and better developer experience
- WhatsApp authentication requires manual QR code scanning on first run
