# Requirements Document

## Introduction

The Automated Birthday WhatsApp Messaging System is an agentic AI application that automatically sends personalized birthday wishes to friends via WhatsApp. The system reads friend data from Google Sheets, determines when birthdays occur based on local time zones, and generates culturally appropriate messages in each friend's mother tongue using ChatGPT.

## Glossary

- **Birthday_Messenger**: The automated system that sends birthday messages via WhatsApp
- **Friend_Data_Store**: Google Sheets containing friend information (birthdates, mother tongue, WhatsApp numbers, country of residence)
- **Message_Generator**: The ChatGPT-powered component that generates birthday messages in specific languages
- **Scheduler**: The component that determines when to send messages based on local time zones
- **WhatsApp_Client**: The component that sends messages through WhatsApp
- **Friend_Record**: A single row in the Friend_Data_Store containing one friend's information
- **Local_Time**: The current time in the friend's country of residence
- **Birthday_Event**: The occurrence of a friend's birthdate in their local time zone

## Requirements

### Requirement 1: Read Friend Data from Google Sheets

**User Story:** As a user, I want the system to read friend data from Google Sheets, so that I can maintain friend information in a centralized location.

#### Acceptance Criteria

1. THE Birthday_Messenger SHALL connect to the Friend_Data_Store using Google Sheets API
2. THE Birthday_Messenger SHALL read all Friend_Records containing birthdate, mother tongue, WhatsApp number, and country of residence
3. WHEN a Friend_Record is missing required fields, THE Birthday_Messenger SHALL log a validation error for that record
4. THE Birthday_Messenger SHALL validate that birthdates are in a parseable date format
5. THE Birthday_Messenger SHALL validate that WhatsApp numbers are in valid E.164 format

### Requirement 2: Determine Birthday Occurrences Based on Local Time

**User Story:** As a user, I want birthday messages sent once daily at 4 AM IST for all friends whose birthday is today in their local timezone, so that messages arrive at an appropriate time for each recipient.

#### Acceptance Criteria

1. THE Scheduler SHALL run once per day at 4:00 AM IST
2. WHEN the Scheduler runs, THE Scheduler SHALL determine the Local_Time for each friend based on their country of residence
3. WHEN a friend's Local_Time indicates today is their birthdate, THE Scheduler SHALL trigger a Birthday_Event for that friend
4. THE Scheduler SHALL handle time zone conversions for all countries represented in the Friend_Data_Store
5. WHEN a friend's country of residence is not recognized, THE Scheduler SHALL log an error and skip that friend

### Requirement 3: Generate Birthday Messages in Mother Tongue

**User Story:** As a user, I want birthday messages generated in each friend's mother tongue, so that messages are culturally appropriate and personal.

#### Acceptance Criteria

1. WHEN a Birthday_Event occurs, THE Message_Generator SHALL generate a birthday message in the friend's mother tongue using ChatGPT API
2. THE Message_Generator SHALL include the friend's name in the generated message
3. THE Message_Generator SHALL generate culturally appropriate birthday wishes for the specified language
4. WHEN the ChatGPT API returns an error, THE Message_Generator SHALL retry up to 3 times with exponential backoff
5. WHEN all retries fail, THE Message_Generator SHALL log the failure and notify the user

### Requirement 4: Send Birthday Messages via WhatsApp

**User Story:** As a user, I want birthday messages automatically sent via WhatsApp, so that my friends receive wishes without manual intervention.

#### Acceptance Criteria

1. WHEN a birthday message is generated, THE WhatsApp_Client SHALL send the message to the friend's WhatsApp number
2. THE WhatsApp_Client SHALL confirm successful message delivery
3. WHEN message delivery fails, THE WhatsApp_Client SHALL retry up to 3 times with 5-minute intervals
4. WHEN all delivery attempts fail, THE WhatsApp_Client SHALL log the failure and notify the user
5. THE Birthday_Messenger SHALL record each sent message with timestamp and delivery status

### Requirement 5: Prevent Duplicate Birthday Messages

**User Story:** As a user, I want to ensure each friend receives only one birthday message per year, so that friends are not spammed with duplicate messages.

#### Acceptance Criteria

1. THE Birthday_Messenger SHALL maintain a record of all sent birthday messages with friend identifier and year
2. WHEN a Birthday_Event occurs, THE Birthday_Messenger SHALL check if a message was already sent to that friend in the current calendar year
3. IF a message was already sent in the current calendar year, THEN THE Birthday_Messenger SHALL skip sending another message
4. THE Birthday_Messenger SHALL persist the sent message record to prevent duplicates across system restarts

### Requirement 6: Handle API Authentication and Credentials

**User Story:** As a user, I want the system to securely manage API credentials, so that my Google Sheets and ChatGPT access remains protected.

#### Acceptance Criteria

1. THE Birthday_Messenger SHALL authenticate with Google Sheets API using OAuth 2.0 credentials
2. THE Birthday_Messenger SHALL authenticate with ChatGPT API using an API key
3. THE Birthday_Messenger SHALL authenticate with WhatsApp using valid authentication credentials
4. THE Birthday_Messenger SHALL store all credentials in environment variables or secure credential storage
5. WHEN authentication fails for any service, THE Birthday_Messenger SHALL log the error and halt execution

### Requirement 7: Error Handling and Logging

**User Story:** As a user, I want comprehensive error logging, so that I can troubleshoot issues when messages fail to send.

#### Acceptance Criteria

1. WHEN any error occurs, THE Birthday_Messenger SHALL log the error with timestamp, component name, and error details
2. THE Birthday_Messenger SHALL log all successful message deliveries with friend identifier and timestamp
3. THE Birthday_Messenger SHALL log all Birthday_Events detected by the Scheduler
4. WHEN critical errors occur, THE Birthday_Messenger SHALL send a notification to the user
5. THE Birthday_Messenger SHALL maintain logs for at least 90 days

### Requirement 8: System Scheduling and Execution

**User Story:** As a user, I want the system to run once daily at 4 AM IST, so that birthday messages are sent automatically without manual intervention.

#### Acceptance Criteria

1. THE Birthday_Messenger SHALL run once per day at 4:00 AM IST
2. WHEN the system executes, THE Birthday_Messenger SHALL validate all API connections before beginning normal operation
3. THE Birthday_Messenger SHALL handle system restarts without losing track of sent messages
4. WHEN the daily execution begins, THE Birthday_Messenger SHALL refresh Friend_Data_Store data to capture updates
5. THE Birthday_Messenger SHALL complete all birthday message processing within the daily execution window
