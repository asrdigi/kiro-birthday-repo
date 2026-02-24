# 🧪 Test Today's Birthday Messages

## 🎯 Quick Test Guide

### **Step 1: Add Test Entry to Google Sheet**

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1HczOqShPv8ZXDXeGyDrxWG0YPEFvypSqWACfjfMsIu0
2. Add a new row with **today's date (February 25)**:

| Name | Birthday | Country | Mother Tongue | WhatsApp Number | Relationship |
|------|----------|---------|---------------|-----------------|--------------|
| Test User | 02/25 | USA | English | +YOUR_PHONE_NUMBER | Friend |

**Important:** 
- Use format `MM/DD` for birthday (e.g., `02/25` for Feb 25)
- Use your actual WhatsApp number with country code (e.g., `+1234567890`)
- Save the sheet

### **Step 2: Run the Test**

```bash
cd kiro-birthday-project
node test-today-birthdays.js
```

### **Step 3: What You'll See**

The script will:
1. ✅ Load friends from Google Sheets
2. ✅ Find birthdays for today (Feb 25)
3. ✅ Generate personalized message with OpenAI
4. ✅ Display QR code for WhatsApp authentication
5. ✅ Send message to your WhatsApp

**Expected Output:**
```
🧪 Testing Today's Birthdays (Feb 25, 2026)
==================================================
📊 Initializing services...
✅ Loaded 10 friends
📅 Testing for date: 2/25/2026

🎉 Found 1 friends with birthdays today:
   • Test User (English) - +1234567890

🤖 Initializing MessageGenerator...
📱 Initializing WhatsApp client...
[QR CODE APPEARS HERE - SCAN IT]

💬 Sending birthday messages...

🎂 Processing Test User...
   📝 Generating message...
   📄 Message preview: Happy Birthday Test User! 🎉🎂 Wishing you an amazing day...
   📱 Sending WhatsApp message...
   ✅ Message sent successfully: msg_12345

🎯 Today's birthday test completed!
```

### **Step 4: Check Your WhatsApp**

You should receive a personalized birthday message on your WhatsApp!

## 🔍 Alternative Testing Methods

### **Method 1: Test Without Sending (Preview Only)**

To see what messages would be generated without actually sending:

```bash
# Temporarily enable test mode
# Edit .env file:
WHATSAPP_TEST_MODE=true

# Run test
node test-today-birthdays.js

# Messages will be logged but not sent
# Change back to false when done
```

### **Method 2: Debug Birthday Detection**

Check which friends have birthdays today:

```bash
node debug-birthdays.js
```

This shows:
- All friends in your sheet
- Their birthdays
- Whether today matches their birthday
- Timezone considerations

### **Method 3: Test Message Generation Only**

See generated messages without WhatsApp:

```bash
node show-complete-message.js
```

## 📋 Test Checklist

Before testing, verify:
- [ ] Google Sheet has entry with today's date (02/25)
- [ ] WhatsApp number is in correct format (+1234567890)
- [ ] `.env` has `WHATSAPP_TEST_MODE=false` for real sending
- [ ] OpenAI API key is valid
- [ ] Google Sheets API credentials are correct

## ⚠️ Important Notes

### **Birthday Format:**
- Use `MM/DD` format in Google Sheet
- Example: `02/25` for February 25
- Don't include year

### **Phone Number Format:**
- Must include country code
- Start with `+`
- No spaces or dashes
- Example: `+919876543210` (India), `+12025551234` (USA)

### **Test Mode vs Real Mode:**
- **Test Mode** (`WHATSAPP_TEST_MODE=true`): Messages logged, not sent
- **Real Mode** (`WHATSAPP_TEST_MODE=false`): Messages actually sent

### **WhatsApp Authentication:**
- QR code appears when script runs
- Scan within 2 minutes
- Session persists in `.wwebjs_auth/` folder
- Only need to scan once (unless you clear the folder)

## 🐛 Troubleshooting

### **"No birthdays today"**
- Check Google Sheet has entry with today's date
- Verify date format is `MM/DD`
- Ensure sheet is saved

### **"WhatsApp client is not ready"**
- Scan the QR code when it appears
- Wait for "Client is ready" message
- Check internet connection

### **"Failed to send message"**
- Verify phone number format (+1234567890)
- Check if number is on WhatsApp
- Ensure WhatsApp Web is working

### **"OpenAI API error"**
- Check API key in `.env` file
- Verify you have credits
- Check API key permissions

## 🎉 Success Criteria

Your test is successful when:
- ✅ Script finds your test entry
- ✅ Message is generated with your name
- ✅ WhatsApp connects successfully
- ✅ Message is sent (shows message ID)
- ✅ You receive the message on your phone

## 📱 After Testing

### **Remove Test Entry:**
After successful test, remove or update the test entry in your Google Sheet to avoid duplicate messages.

### **Keep for Future:**
Or change the birthday to a different date for future testing.

### **Production Ready:**
Once tested successfully, your app is ready to run continuously:

```bash
node run-continuous.js
```

This will:
- Run 24/7
- Check birthdays daily at 4 AM IST
- Send messages automatically
- Log all activities

---

**🎯 Ready to test? Add yourself to the Google Sheet with today's date and run `node test-today-birthdays.js`!**