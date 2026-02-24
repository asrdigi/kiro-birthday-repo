# 🎉 Birthday WhatsApp Messenger - Setup Guide

**Automated birthday wishes via WhatsApp with AI-generated personalized messages in multiple languages!**

## 🌟 Features

- ✅ **Automated Daily Execution** at 4:00 AM IST
- ✅ **Google Sheets Integration** for friend data management
- ✅ **AI-Powered Messages** in multiple languages (Hindi, English, Telugu, Spanish, etc.)
- ✅ **WhatsApp Integration** with real message delivery
- ✅ **Smart Phone Number Formatting** (auto-adds country codes)
- ✅ **Comprehensive Logging** and monitoring
- ✅ **Easy Friend Management** (add/update friends anytime in Google Sheets)

## 📋 Prerequisites

Before you start, make sure you have:

### **System Requirements:**
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Google Account** (for Google Sheets API)
- **OpenAI Account** (for AI message generation)
- **WhatsApp** on your phone (for authentication)

### **Accounts You'll Need:**
1. **Google Cloud Console** account (free)
2. **OpenAI API** account (paid, ~$5-10/month for typical usage)
3. **Google Sheets** (free)

## 🚀 Quick Start

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Build the Project**
```bash
npm run build
```

### **Step 3: Configure Environment**
1. Copy `.env.example` to `.env`
2. Fill in your API keys and credentials (see Configuration section below)

### **Step 4: Set Up Google Sheets**
1. Create a Google Sheet with your friends' data
2. Share it with your service account email
3. Copy the Sheet ID to your `.env` file

### **Step 5: Run the Application**
```bash
# For continuous mode (recommended)
node run-continuous.js

# Or standard mode
npm start
```

## ⚙️ Configuration

### **1. Google Sheets API Setup**

#### **Create Service Account:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create Service Account credentials
5. Download the JSON key file

#### **Extract Credentials:**
From your downloaded JSON file, you need:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

### **2. OpenAI API Setup**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and add billing information
3. Generate an API key
4. Copy the key → `OPENAI_API_KEY`

### **3. Google Sheets Setup**
1. Create a new Google Sheet
2. Set up columns exactly like this:

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| **Name** | **Birthdate** | **Mother Tongue** | **WhatsApp Number** | **Country** |
| John Doe | 1990-03-15 | en | 9876543210 | India |
| Maria Garcia | 1985-07-22 | es | 8765432109 | India |

3. Share the sheet with your service account email (from step 1)
4. Copy the Sheet ID from the URL → `GOOGLE_SHEET_ID`

### **4. Environment Variables**
Edit your `.env` file:

```env
# Google Sheets API (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n

# OpenAI API
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Google Sheet ID (from the URL)
GOOGLE_SHEET_ID=your-google-sheet-id-here

# WhatsApp Settings
WHATSAPP_TEST_MODE=false
COMPLETE_TEST_MODE=false

# Schedule (4 AM IST daily)
CRON_SCHEDULE=0 4 * * *
SCHEDULER_TIMEZONE=Asia/Kolkata
```

## 📊 Google Sheets Format

### **Required Columns:**
- **Name**: Friend's full name
- **Birthdate**: Format YYYY-MM-DD (e.g., 1990-03-15)
- **Mother Tongue**: Language code (en, hi, te, es, fr, etc.)
- **WhatsApp Number**: Just digits (app auto-formats with country code)
- **Country**: Full country name (India, United States, etc.)

### **Supported Languages:**
- `en` - English
- `hi` - Hindi  
- `te` - Telugu
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- And many more...

## 🎯 Running the Application

### **Option 1: Continuous Mode (Recommended)**
```bash
node run-continuous.js
```
- Runs continuously in background
- Executes daily at 4 AM IST
- Enhanced logging and monitoring
- Auto-restart on errors

### **Option 2: Standard Mode**
```bash
npm start
```
- Basic continuous mode
- Standard logging

### **Option 3: One-Time Execution**
```bash
node run-once.js
```
- Runs once and exits
- Good for testing

## 🧪 Testing

### **Test Your Setup:**
```bash
# Check if everything is configured correctly
node whatsapp-health-check.js

# Debug friend data loading
node debug-birthdays.js

# Test real WhatsApp messages (with friends who have birthdays today)
node test-real-whatsapp.js
```

### **Test Mode:**
Set `WHATSAPP_TEST_MODE=true` in `.env` to simulate messages without sending real WhatsApp messages.

## 🔧 Troubleshooting

### **WhatsApp Issues:**
```bash
# Clean up WhatsApp cache
node cleanup-whatsapp.js

# Health check
node whatsapp-health-check.js
```

### **Common Issues:**

#### **"Can't link new devices"**
- Wait 2-4 hours and try again
- Check Settings → Linked Devices on your phone
- Remove old/unused linked devices

#### **Google Sheets not loading**
- Verify service account email is shared with the sheet
- Check Sheet ID in `.env`
- Ensure Google Sheets API is enabled

#### **OpenAI errors**
- Check API key is correct
- Verify billing is set up on OpenAI account
- Check usage limits

## 📅 Adding New Friends

You can add friends to your Google Sheet anytime:
1. Open your Google Sheet
2. Add a new row with friend's information
3. The app will automatically pick up new friends within 24 hours
4. Or restart the app for immediate updates

## 📄 Logs

Logs are saved to:
- `logs/birthday-app-YYYY-MM-DD.log` (daily logs)
- Console output (real-time)

## 🛑 Stopping the Application

Press `Ctrl+C` to stop the application gracefully.

## 💡 Tips

1. **Keep your computer running** for daily execution
2. **Monitor logs** for any issues
3. **Update friends anytime** in Google Sheets
4. **Test with friends** who have birthdays today
5. **Keep WhatsApp active** on your phone

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review log files for error details
3. Test individual components using the test scripts
4. Ensure all prerequisites are met

## 🎉 Enjoy!

Your friends will love receiving personalized birthday messages in their native language! 

---

**Made with ❤️ for spreading birthday joy!**