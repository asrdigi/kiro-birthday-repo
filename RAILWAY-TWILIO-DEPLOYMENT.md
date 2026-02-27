# Railway Deployment Guide - Twilio WhatsApp Migration

## Overview

This guide walks you through deploying your Birthday WhatsApp Messenger to Railway using the new Twilio WhatsApp API. The application will run autonomously in the cloud without requiring QR code authentication.

## Prerequisites

✅ Twilio account created and configured
✅ WhatsApp sandbox tested successfully
✅ Local testing completed
✅ Railway account (free tier works)
✅ Git repository connected to Railway

## Step 1: Prepare Environment Variables

You need to configure these environment variables in Railway:

### Required Variables

```bash
# Google Sheets Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_SHEET_ID=your_sheet_id_here

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_SANDBOX_MODE=true
WHATSAPP_TEST_MODE=false

# Scheduler Configuration
CRON_SCHEDULE=0 4 * * *
SCHEDULER_TIMEZONE=Asia/Kolkata
COMPLETE_TEST_MODE=false
```

### Important Notes

- **GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY**: Must include `\n` for line breaks
- **TWILIO_ACCOUNT_SID**: Starts with "AC" (32 characters)
- **TWILIO_AUTH_TOKEN**: Keep this secret
- **TWILIO_WHATSAPP_FROM**: Must include "whatsapp:" prefix
- **TWILIO_SANDBOX_MODE**: Set to `true` for sandbox, `false` for production
- **WHATSAPP_TEST_MODE**: Must be `false` for real message sending

## Step 2: Configure Railway Environment Variables

### Option A: Using Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Select your project

2. **Navigate to Variables Tab**
   - Click on your service
   - Click "Variables" tab

3. **Add Each Variable**
   - Click "New Variable"
   - Enter variable name and value
   - Click "Add"
   - Repeat for all variables

4. **Verify All Variables**
   - Check that all required variables are present
   - Verify no typos in variable names
   - Ensure values are correct (especially private key format)

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Set variables one by one
railway variables set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set TWILIO_AUTH_TOKEN=your_auth_token_here
railway variables set TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
railway variables set TWILIO_SANDBOX_MODE=true
railway variables set WHATSAPP_TEST_MODE=false

# Set other variables...
```

## Step 3: Deploy to Railway

### Automatic Deployment (Recommended)

If you have GitHub integration enabled:

1. **Commit Your Changes**
   ```bash
   cd kiro-birthday-project
   git add .
   git commit -m "Migrate to Twilio WhatsApp API"
   git push origin main
   ```

2. **Railway Auto-Deploys**
   - Railway detects the push
   - Automatically builds and deploys
   - Monitor progress in Railway dashboard

### Manual Deployment

If using Railway CLI:

```bash
# Deploy from local directory
railway up
```

## Step 4: Verify Deployment

### Check Build Logs

1. **Open Railway Dashboard**
   - Go to your project
   - Click on the deployment

2. **Monitor Build Logs**
   - Look for successful build messages
   - Check for any errors
   - Verify TypeScript compilation succeeds

3. **Expected Log Messages**
   ```
   ✓ TypeScript compilation successful
   ✓ Dependencies installed
   ✓ Build completed
   ```

### Check Runtime Logs

1. **View Application Logs**
   - In Railway dashboard, click "View Logs"
   - Look for initialization messages

2. **Expected Initialization Logs**
   ```
   [INFO] [TwilioWhatsAppClient] Initializing Twilio WhatsApp client...
   [INFO] [TwilioWhatsAppClient] Successfully initialized
   [INFO] [Scheduler] Scheduler initialized
   [INFO] [Scheduler] Next run scheduled for: ...
   ```

3. **Check for Errors**
   - No "Missing required" errors
   - No authentication failures
   - No QR code errors (should be gone!)

## Step 5: Test on Railway

### Option A: Wait for Scheduled Run

- Wait for next 4 AM IST run
- Monitor Railway logs during execution
- Verify messages are sent

### Option B: Trigger Manual Test

Create a test endpoint or use Railway's shell:

```bash
# In Railway shell
node test-today-birthdays.js
```

## Step 6: Verify Message Delivery

### Check Railway Logs

Look for these log messages:

```
[INFO] [TwilioWhatsAppClient] Sending message to +91xxxxxxxxxx
[INFO] [TwilioWhatsAppClient] Successfully sent message
```

### Check Twilio Console

1. **Go to Twilio Console**
   - Visit: https://console.twilio.com/
   - Navigate to Monitor → Logs → Messaging

2. **Verify Message Status**
   - Status: queued → sent → delivered
   - Check for any errors
   - Verify cost (should be $0.00 in sandbox)

### Check WhatsApp

- Verify messages received on test phone
- Check message content and formatting
- Confirm correct language and personalization

## Troubleshooting

### Error: "Missing required Twilio environment variables"

**Solution:**
- Check all three Twilio variables are set in Railway
- Verify variable names match exactly (case-sensitive)
- No extra spaces in variable values

### Error: "TWILIO_ACCOUNT_SID must start with AC"

**Solution:**
- Copy Account SID from Twilio Console again
- Ensure you copied the full 32-character string
- Check for any hidden characters

### Error: "Authentication failed" (Twilio error 20003)

**Solution:**
- Verify TWILIO_AUTH_TOKEN is correct
- Try regenerating Auth Token in Twilio Console
- Update Railway environment variable with new token

### Error: "Invalid phone number format"

**Solution:**
- Check phone numbers in Google Sheets are in E.164 format
- Format: +[country code][number]
- Example: +919876543210 (not 9876543210)

### Application Not Starting

**Solution:**
1. Check Railway build logs for compilation errors
2. Verify all environment variables are set
3. Check for missing dependencies in package.json
4. Ensure start command is correct: `node dist/railway-app.js`

### Messages Not Sending

**Solution:**
1. Verify WHATSAPP_TEST_MODE=false in Railway
2. Check TWILIO_SANDBOX_MODE matches your setup
3. Verify recipient numbers joined sandbox (if using sandbox)
4. Check Twilio Console for API errors

## Cost Monitoring

### Sandbox (Current Setup)

- **Cost**: $0.00 (Free)
- **Limitation**: Only sandbox-joined numbers receive messages
- **Best for**: Testing and development

### Production (Future)

- **Cost**: ~$0.005 per message (₹0.42)
- **Annual estimate**: 
  - 50 messages: $0.25 (₹21)
  - 100 messages: $0.50 (₹42)
  - 200 messages: $1.00 (₹84)
- **Well within ₹100/year budget**

### Set Up Usage Alerts

1. **In Twilio Console**
   - Go to Account → Usage Triggers
   - Click "Create new usage trigger"

2. **Configure Alert**
   - Trigger when: Usage reaches
   - Amount: $5 (or your preferred threshold)
   - Notification: Email

## Production Deployment (Optional)

To send messages to any WhatsApp number (not just sandbox):

### 1. Request Production Access

1. **In Twilio Console**
   - Go to Messaging → Senders → WhatsApp senders
   - Click "Request to enable my Twilio numbers for WhatsApp"

2. **Complete Business Profile**
   - Business name
   - Business website
   - Business description
   - Use case: "Birthday notifications for friends and family"

3. **Wait for Approval** (1-3 business days)

### 2. Get Production Number

1. **Purchase Twilio Phone Number**
   - In Twilio Console: Phone Numbers → Buy a number
   - Select a number with WhatsApp capability
   - Complete purchase

2. **Enable for WhatsApp**
   - Number should be automatically enabled
   - Verify in WhatsApp senders list

### 3. Update Railway Variables

```bash
# Update these variables in Railway
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890  # Your production number
TWILIO_SANDBOX_MODE=false
```

### 4. Redeploy

- Railway will automatically redeploy with new variables
- Monitor logs for successful initialization
- Test with a real phone number (no sandbox join required)

## Monitoring and Maintenance

### Daily Checks

- Check Railway logs for successful runs
- Verify messages are being sent
- Monitor Twilio Console for delivery status

### Weekly Checks

- Review Twilio usage and costs
- Check for any failed deliveries
- Verify all friends' birthdays are being caught

### Monthly Checks

- Review total cost (should be minimal)
- Update friend list in Google Sheets if needed
- Check for any Railway service issues

## Rollback Procedure

If you need to rollback to the old whatsapp-web.js implementation:

### 1. Restore Old Files

```bash
cd kiro-birthday-project/src/services
mv WhatsAppClient.ts.backup WhatsAppClient.ts
mv WhatsAppClient.test.ts.backup WhatsAppClient.test.ts
```

### 2. Update Imports

```bash
# In src/index.ts and src/railway-app.ts
# Change back to:
import { WhatsAppClient } from './services/WhatsAppClient';
```

### 3. Reinstall Dependencies

```bash
npm install whatsapp-web.js puppeteer qrcode-terminal
npm uninstall twilio
```

### 4. Redeploy

```bash
git add .
git commit -m "Rollback to whatsapp-web.js"
git push origin main
```

**Note**: Rollback will require QR code authentication again, which won't work on Railway. You'll need to run locally.

## Success Checklist

- [ ] All environment variables configured in Railway
- [ ] Application builds successfully
- [ ] Application starts without errors
- [ ] No QR code authentication errors in logs
- [ ] Scheduler initializes correctly
- [ ] Messages send successfully via Twilio
- [ ] Messages delivered to WhatsApp
- [ ] Cost tracking shows $0.00 (sandbox) or expected cost
- [ ] Logs show successful delivery status

## Support Resources

- **Railway Documentation**: https://docs.railway.app/
- **Twilio WhatsApp Docs**: https://www.twilio.com/docs/whatsapp
- **Twilio Console**: https://console.twilio.com/
- **Railway Dashboard**: https://railway.app/dashboard

## Next Steps

After successful deployment:

1. ✅ Monitor first scheduled run (4 AM IST)
2. ✅ Verify birthday detection works
3. ✅ Confirm message delivery
4. ✅ Set up Twilio usage alerts
5. ✅ Consider upgrading to production WhatsApp access
6. ✅ Document any issues or improvements

---

**Congratulations!** 🎉 Your Birthday WhatsApp Messenger is now running autonomously on Railway with Twilio WhatsApp API!
