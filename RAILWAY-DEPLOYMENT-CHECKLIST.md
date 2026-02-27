# Railway Deployment Checklist - Twilio Migration

Use this checklist to ensure smooth deployment to Railway with Twilio WhatsApp API.

## Pre-Deployment Checklist

### Local Testing
- [ ] ✅ Built successfully: `npm run build`
- [ ] ✅ Tested with Twilio sandbox: `node test-twilio-sandbox.js +91xxxxxxxxxx`
- [ ] ✅ Tested full workflow: `node test-today-birthdays.js`
- [ ] ✅ Verified messages received on WhatsApp
- [ ] ✅ Checked Twilio Console for delivery status

### Environment Variables Ready
- [ ] GOOGLE_SERVICE_ACCOUNT_EMAIL
- [ ] GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (with `\n` for line breaks)
- [ ] GOOGLE_SHEET_ID
- [ ] OPENAI_API_KEY
- [ ] TWILIO_ACCOUNT_SID (starts with "AC")
- [ ] TWILIO_AUTH_TOKEN
- [ ] TWILIO_WHATSAPP_FROM (with "whatsapp:" prefix)
- [ ] TWILIO_SANDBOX_MODE (true for sandbox, false for production)
- [ ] WHATSAPP_TEST_MODE (must be false)
- [ ] CRON_SCHEDULE (0 4 * * *)
- [ ] SCHEDULER_TIMEZONE (Asia/Kolkata)
- [ ] COMPLETE_TEST_MODE (false)

### Code Ready
- [ ] All changes committed to Git
- [ ] Pushed to main branch
- [ ] No .env file in repository (should be in .gitignore)
- [ ] package.json includes twilio dependency
- [ ] tsconfig.json excludes old WhatsAppClient files

## Deployment Steps

### Step 1: Configure Railway
- [ ] Logged into Railway dashboard
- [ ] Selected correct project
- [ ] Navigated to Variables tab

### Step 2: Add Environment Variables
- [ ] Added all 12 required environment variables
- [ ] Verified no typos in variable names
- [ ] Checked values are correct (especially private key format)
- [ ] Saved all variables

### Step 3: Deploy
- [ ] Pushed code to GitHub (if using GitHub integration)
  ```bash
  git add .
  git commit -m "Deploy Twilio WhatsApp migration to Railway"
  git push origin main
  ```
- [ ] OR deployed via Railway CLI: `railway up`

### Step 4: Monitor Deployment
- [ ] Watched build logs in Railway dashboard
- [ ] Verified TypeScript compilation succeeded
- [ ] Checked for dependency installation errors
- [ ] Confirmed build completed successfully

## Post-Deployment Verification

### Check Application Logs
- [ ] Application started without errors
- [ ] Saw: `[INFO] [TwilioWhatsAppClient] Initializing Twilio WhatsApp client...`
- [ ] Saw: `[INFO] [TwilioWhatsAppClient] Successfully initialized`
- [ ] Saw: `[INFO] [Scheduler] Scheduler initialized`
- [ ] Saw: `[INFO] [Scheduler] Next run scheduled for: ...`
- [ ] NO "Missing required" errors
- [ ] NO QR code authentication errors
- [ ] NO authentication failures

### Test Message Sending (Optional)
- [ ] Triggered manual test (if possible)
- [ ] Verified message sent in logs
- [ ] Checked Twilio Console for message status
- [ ] Confirmed message received on WhatsApp

### Verify Scheduler
- [ ] Confirmed next run time is correct (4 AM IST)
- [ ] Timezone is Asia/Kolkata
- [ ] No scheduler errors in logs

## Monitoring Setup

### Twilio Console
- [ ] Opened Twilio Console: https://console.twilio.com/
- [ ] Navigated to Monitor → Logs → Messaging
- [ ] Bookmarked for easy access
- [ ] Set up usage alerts (optional but recommended)

### Railway Dashboard
- [ ] Bookmarked Railway project URL
- [ ] Enabled email notifications for deployment failures
- [ ] Checked resource usage (should be minimal)

## First Scheduled Run

### Before 4 AM IST
- [ ] Verified application is running
- [ ] Checked no errors in logs
- [ ] Confirmed scheduler is active

### During/After 4 AM IST Run
- [ ] Monitored Railway logs during execution
- [ ] Verified birthday detection worked
- [ ] Confirmed messages were sent
- [ ] Checked Twilio Console for delivery status
- [ ] Verified messages received on WhatsApp
- [ ] Reviewed any errors or warnings

## Success Criteria

All of these should be true:

- ✅ Application deployed successfully to Railway
- ✅ No build or runtime errors
- ✅ Twilio client initialized successfully
- ✅ Scheduler running and next run scheduled
- ✅ Test messages sent and delivered
- ✅ No QR code authentication required
- ✅ Cost tracking shows expected values
- ✅ Application runs autonomously without intervention

## Troubleshooting

If any checks fail, refer to:
- [RAILWAY-TWILIO-DEPLOYMENT.md](./RAILWAY-TWILIO-DEPLOYMENT.md) - Detailed deployment guide
- [TWILIO-SETUP-GUIDE.md](./TWILIO-SETUP-GUIDE.md) - Twilio configuration help
- [TWILIO-MIGRATION-STATUS.md](./TWILIO-MIGRATION-STATUS.md) - Migration status and notes

## Common Issues

### Issue: "Missing required Twilio environment variables"
**Fix**: Add all three Twilio variables in Railway dashboard

### Issue: "Authentication failed"
**Fix**: Verify TWILIO_AUTH_TOKEN is correct, regenerate if needed

### Issue: "Invalid phone number format"
**Fix**: Ensure phone numbers in Google Sheets are in E.164 format (+91xxxxxxxxxx)

### Issue: Application not starting
**Fix**: Check Railway build logs for compilation errors, verify all dependencies installed

### Issue: Messages not sending
**Fix**: Verify WHATSAPP_TEST_MODE=false and TWILIO_SANDBOX_MODE matches your setup

## Next Steps After Successful Deployment

1. **Monitor First Week**
   - Check logs daily
   - Verify all birthdays are caught
   - Confirm message delivery

2. **Set Up Alerts**
   - Twilio usage alerts
   - Railway deployment failure notifications

3. **Consider Production Upgrade**
   - Request Twilio production WhatsApp access
   - Remove sandbox limitations
   - Send to any WhatsApp number

4. **Document Learnings**
   - Note any issues encountered
   - Document solutions
   - Update this checklist if needed

---

**Date Deployed**: _________________

**Deployed By**: _________________

**Notes**: _________________

---

🎉 **Congratulations on your successful deployment!**
