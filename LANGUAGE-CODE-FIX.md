# Language Code Issue - Fix Guide

## Problem Identified

Your Google Sheet contains an **invalid language code** that's preventing the birthday system from working correctly.

### Current Issue:
- **Srinivas Reddy** has language code `ur` (Urdu)
- The template system only supports 6 languages: `te`, `hi`, `en`, `ta`, `kn`, `ml`
- When the system tries to generate a message for `ur`, it fails with "No templates found for language: ur"

## Valid Language Codes

Your system supports these 6 languages only:

| Code | Language   |
|------|------------|
| `te` | Telugu     |
| `hi` | Hindi      |
| `en` | English    |
| `ta` | Tamil      |
| `kn` | Kannada    |
| `ml` | Malayalam  |

## Required Fix

### Step 1: Update Google Sheet

Open your Google Sheet and change Srinivas Reddy's "Mother Tongue" from `ur` to one of the valid codes above.

**Recommended:** Change `ur` to `te` (Telugu) since most of your contacts use Telugu.

### Step 2: Verify Your Data

After fixing, your Feb 28 birthdays should look like this:

| Name | Birthdate | Mother Tongue | WhatsApp Number | Country |
|------|-----------|---------------|-----------------|---------|
| Srinivas Reddy | 28/02/1965 | **te** ✅ | 7396661509 | India |
| Padma Latha | 28/02/1970 | en ✅ | 9100020013 | India |

### Step 3: Test Locally

After fixing the Google Sheet, run the test:

```bash
cd kiro-birthday-project
node test-today-birthdays.js
```

**Expected output:**
```
🎉 Found 2 friends with birthdays today:
   • Srinivas Reddy (te) - +917396661509
   • Padma Latha (en) - +919100020013
```

## Why Only 1 Message Was Sent on Railway

Looking at your Railway logs from Feb 28, 2026:

1. **Scheduler triggered at 4:00 AM** ✅
2. **System detected birthdays** ✅
3. **Tried to send to Srinivas Reddy** ❌ Failed (invalid language code `ur`)
4. **Sent to Chandra Shekar** ✅ Success (valid language code)

The system stopped after the first failure, which is why only 1 message was sent.

## Additional Railway Configuration Needed

After fixing the language code, you also need to add this environment variable to Railway:

```
MESSAGE_MODE=template
```

**How to add it:**
1. Go to Railway dashboard
2. Select your project
3. Go to Variables tab
4. Add: `MESSAGE_MODE` = `template`
5. Redeploy

## Date Format Reminder

Make sure all dates in your Google Sheet are in `DD/MM/YYYY` format:

✅ Correct: `28/02/1965`
❌ Wrong: `1965-02-28`

## Summary

**To fix the issue:**
1. Change `ur` to `te` (or another valid code) in Google Sheet
2. Add `MESSAGE_MODE=template` to Railway environment variables
3. Test locally with `node test-today-birthdays.js`
4. Redeploy to Railway

After these fixes, the system should detect and send messages to all 2 people with Feb 28 birthdays.
