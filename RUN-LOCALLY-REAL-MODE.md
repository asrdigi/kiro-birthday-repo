# 📱 Run Locally in Real WhatsApp Mode

## ✅ Setup Complete!

Your `.env` file has been updated to run in **REAL MODE** with actual WhatsApp message sending.

## 🚀 Quick Start

### Step 1: Clean Up Old WhatsApp Session (If Needed)
```bash
cd kiro-birthday-project

# Remove old WhatsApp session data
node cleanup-whatsapp.js
```

### Step 2: Start the Application
```bash
# Run continuously (recommended for 24/7 operation)
node run-continuous.js
```

### Step 3: Scan QR Code
When you see the QR code in your terminal:
1. Open WhatsApp on your phone
2. Go to **Settings** → **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code displayed in your terminal

### Step 4: Wait for Connection
You'll see:
```
✅ Authentication successful
✅ Client is ready and connected
✅ Scheduler started successfully
```

## 📋 What Happens Now

### Daily Schedule:
- **Every day at 4:00 AM IST**, the app will:
  1. Load friend data from Google Sheets
  2. Check for birthdays in each friend's timezone
  3. Generate personalized messages with OpenAI
  4. Send actual WhatsApp messages
  5. Log all activities

### Immediate Testing:
If you want to test right now without waiting for 4 AM:
```bash
# Test with today's birthdays
node test-today-birthdays.js

# Or run once immediately
node run-once.js
```

## 🔍 Monitoring

### Check Application Status:
```bash
# View logs in real-time
# The application will log to console

# Check WhatsApp connection health
node whatsapp-health-check.js
```

### What You'll See in Logs:
```
[INFO] Checking birthdays for 10 friends
[INFO] Birthday detected for John Doe (USA)
[INFO] Generating birthday message for John Doe...
[INFO] Sending birthday message to +1234567890...
[INFO] Successfully sent birthday message to John Doe
```

## ⚠️ Important Notes

### Keep Your Computer Running:
- Your computer must stay on 24/7 for the app to work
- WhatsApp session will persist in `.wwebjs_auth/` folder
- If computer restarts, you may need to scan QR code again

### WhatsApp Session:
- Session data is stored in `.wwebjs_auth/` folder
- Don't delete this folder unless you want to re-authenticate
- Session usually lasts for weeks/months

### Network Connection:
- Stable internet connection required
- WhatsApp Web requires active connection
- If disconnected, app will try to reconnect

## 🛠️ Troubleshooting

### QR Code Not Appearing:
```bash
# Clean up and try again
node cleanup-whatsapp.js
node run-continuous.js
```

### "Can't link device at this time":
This is a temporary WhatsApp restriction. Solutions:
1. Wait 12-24 hours and try again
2. Try from a different network (mobile hotspot)
3. Use a different phone number
4. See: `WHATSAPP-TROUBLESHOOTING.md`

### WhatsApp Disconnects:
```bash
# Check connection status
node whatsapp-health-check.js

# Restart the application
# Press Ctrl+C to stop
node run-continuous.js
```

### Messages Not Sending:
1. Check WhatsApp connection: `node whatsapp-health-check.js`
2. Verify phone numbers are in correct format: `+1234567890`
3. Check logs for specific error messages
4. Ensure you have internet connection

## 📊 Testing Before Production

### Test with Specific Friend:
Create a test script to send to yourself:
```bash
# Edit send-to-srinivas.js with your number
node send-to-srinivas.js
```

### Test Birthday Detection:
```bash
# Check today's birthdays
node test-today-birthdays.js

# Check tomorrow's birthdays
node test-tomorrow-birthdays.js

# Debug birthday logic
node debug-birthdays.js
```

### Test Message Generation:
```bash
# See complete generated messages
node show-complete-message.js

# Debug message generation
node debug-message-generation.js
```

## 🔄 Switching Between Test and Real Mode

### To Switch Back to Test Mode:
Edit `.env` file:
```bash
WHATSAPP_TEST_MODE=true
```

### To Use Real Mode:
Edit `.env` file:
```bash
WHATSAPP_TEST_MODE=false
```

Then restart the application.

## 🎯 Production Checklist

Before running 24/7:
- [ ] WhatsApp authenticated and connected
- [ ] Tested with your own number first
- [ ] Verified message generation quality
- [ ] Checked all friend data in Google Sheets
- [ ] Confirmed phone numbers are correct format
- [ ] Computer set to never sleep
- [ ] Stable internet connection
- [ ] Backup power (UPS recommended)

## 💡 Best Practices

### 1. Test First:
Always test with your own number before sending to friends:
```javascript
// In your Google Sheet, add yourself as a test entry
// Set your birthday to today
// Run: node run-once.js
```

### 2. Monitor Logs:
Keep an eye on logs for the first few days to ensure everything works correctly.

### 3. Backup Strategy:
- Keep Railway running in test mode as backup
- Export Google Sheet regularly
- Keep logs of sent messages

### 4. Computer Maintenance:
- Set computer to never sleep
- Disable automatic updates during night
- Ensure stable power supply
- Monitor disk space for logs

## 🔐 Security Reminders

- Never commit `.env` file to Git (it's in `.gitignore`)
- Keep your WhatsApp session secure
- Don't share `.wwebjs_auth/` folder
- Regularly update dependencies

## 📞 Support

### Common Commands:
```bash
# Start application
node run-continuous.js

# Run once immediately
node run-once.js

# Clean WhatsApp session
node cleanup-whatsapp.js

# Check WhatsApp health
node whatsapp-health-check.js

# Test today's birthdays
node test-today-birthdays.js
```

### Log Files:
- Application logs: Console output
- Database: `data/birthday_messenger.db`
- WhatsApp session: `.wwebjs_auth/`

## 🎉 You're All Set!

Your Birthday WhatsApp Messenger is now configured to send **REAL WhatsApp messages** locally!

**Next Step:** Run `node run-continuous.js` and scan the QR code!

---

**Note:** Keep Railway running in test mode as a backup monitoring system. This gives you redundancy and cloud-based logging even while running locally.