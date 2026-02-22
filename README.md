# Birthday WhatsApp Messenger

An automated system that sends personalized birthday wishes to friends via WhatsApp. The system reads friend data from Google Sheets, generates culturally appropriate messages in each friend's mother tongue using ChatGPT, and sends them via WhatsApp once daily at 4 AM IST.

## Features

- 📊 Reads friend data from Google Sheets
- 🌍 Handles multiple timezones based on country of residence
- 🤖 Generates personalized messages using ChatGPT in the recipient's mother tongue
- 💬 Sends messages via WhatsApp Web
- 🔄 Prevents duplicate messages with SQLite tracking
- ⏰ Runs automatically once daily at 4:00 AM IST
- 🔒 Secure credential management via environment variables

## Prerequisites

- Node.js 18+ and npm
- Google Cloud Platform account with Sheets API enabled
- OpenAI API key
- WhatsApp account for sending messages

## Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the example environment file and configure it:

```bash
cp .env.example .env
```

3. Edit `.env` and add your credentials:
   - Google Sheets API credentials (OAuth 2.0)
   - Google Sheet ID containing friend data
   - OpenAI API key
   - Configure other settings as needed

## Google Sheets Setup

Create a Google Sheet with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| Name | Friend's full name | "Maria Garcia" |
| Birthdate | Date of birth | "1990-05-15" |
| Mother Tongue | Language code | "es" |
| WhatsApp Number | Phone with country code | "+34612345678" |
| Country | Country of residence | "Spain" |

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
# Build the project
npm run build

# Start the application
npm start
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## WhatsApp Authentication

On first run, the application will display a QR code in the terminal. Scan this QR code with your WhatsApp mobile app to authenticate. The session will be saved in `.wwebjs_auth/` directory for future runs.

## Project Structure

```
.
├── src/
│   ├── index.ts           # Main entry point
│   ├── services/          # Service classes
│   ├── models/            # TypeScript interfaces and types
│   └── utils/             # Utility functions
├── tests/                 # Unit and property-based tests
├── dist/                  # Compiled JavaScript (generated)
└── data/                  # SQLite database (generated)
```

## Architecture

The system consists of five main components:

1. **Scheduler Service**: Orchestrates daily birthday checks at 4:00 AM IST
2. **Data Loader**: Fetches and validates friend data from Google Sheets
3. **Message Generator**: Generates personalized messages using ChatGPT
4. **WhatsApp Client**: Manages WhatsApp connection and message delivery
5. **State Manager**: Tracks sent messages in SQLite to prevent duplicates

## License

ISC


Step 1: Create a New Google Sheet
Go to Google Sheets
Click "+ Blank" to create a new spreadsheet
Name it something like "Birthday Friends List"
Step 2: Get the Google Sheet ID
The Sheet ID is in the URL. After creating your sheet, look at the browser address bar:

https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j_EXAMPLE_ID/edit
                                      ^^^^^^^^^^^^^^^^^^^^^^^^
                                      This is your SHEET ID
Copy everything between /d/ and /edit - that's your GOOGLE_SHEET_ID.

Step 3: Set Up the Columns
In Row 1 (the header row), create these 5 columns exactly as shown:

Column A	Column B	Column C	Column D	Column E
Name	Birthdate	Mother Tongue	WhatsApp Number	Country
Step 4: Add Sample Data
Here's an example of how to fill in the data (starting from Row 2):

Name	Birthdate	Mother Tongue	WhatsApp Number	Country
John Doe	1990-05-15	en	+1234567890	USA
Maria Garcia	1985-12-25	es	+34612345678	Spain
Raj Kumar	1992-08-20	hi	+919876543210	India
Yuki Tanaka	1988-03-10	ja	+819012345678	Japan
Column Details:
1. Name (Column A)
Friend's full name
Example: John Doe, Maria Garcia
2. Birthdate (Column B)
Supported formats:
YYYY-MM-DD (recommended): 1990-05-15
MM/DD/YYYY: 05/15/1990
DD-MM-YYYY: 15-05-1990
3. Mother Tongue (Column C)
Language code (ISO 639-1)
Common codes:
en - English
es - Spanish
hi - Hindi
ja - Japanese
fr - French
de - German
zh - Chinese
ar - Arabic
pt - Portuguese
ru - Russian
4. WhatsApp Number (Column D)
Must be in E.164 format: +[country code][number]
Examples:
USA: +1234567890
India: +919876543210
Spain: +34612345678
UK: +447123456789
Important: Include the + and country code!
5. Country (Column E)
Country of residence (for timezone calculation)
Supported countries (70+):
USA, United States, India, UK, United Kingdom
Spain, France, Germany, Italy, Japan, China
Canada, Mexico, Brazil, Australia, etc.
See the full list in 
timezone.ts
Step 5: Share the Sheet (Important!)
You need to give your application access to the sheet:

Click "Share" button (top right)
Add the email from your Google Cloud OAuth credentials
Set permission to "Editor"
Click "Done"
Step 6: Update Your .env File
Add the Sheet ID to your .env file:

GOOGLE_SHEET_ID=1a2b3c4d5e6f7g8h9i0j_YOUR_ACTUAL_ID
Quick Reference Template
Here's a template you can copy-paste into your Google Sheet:

Name                Birthdate       Mother Tongue   WhatsApp Number     Country
John Doe            1990-05-15      en              +1234567890         USA
Maria Garcia        1985-12-25      es              +34612345678        Spain
Raj Kumar           1992-08-20      hi              +919876543210       India
That's it! Your Google Sheet is now ready to work with the Birthday WhatsApp Messenger application.