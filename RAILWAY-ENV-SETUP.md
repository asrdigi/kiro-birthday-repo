# 🔧 Railway Environment Variables Setup

## ❌ Current Issue
```
Missing required environment variables: 
GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, 
GOOGLE_SHEET_ID, OPENAI_API_KEY
```

## 🚀 Solution: Configure Environment Variables in Railway

### Step 1: Access Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Login to your account
3. Find your deployed project
4. Click on your project to open it

### Step 2: Navigate to Variables
1. In your project dashboard, look for the **"Variables"** tab
2. Click on **"Variables"** (usually in the left sidebar or top navigation)
3. You'll see an interface to add environment variables

### Step 3: Add Required Variables

Click **"New Variable"** for each of these and add:

#### 🔑 Google Sheets API Configuration
```bash
Variable Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: your-service-account@your-project.iam.gserviceaccount.com
```

```bash
Variable Name: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----
YOUR_ACTUAL_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----
```
**⚠️ Important:** For the private key, make sure to:
- Include the full key with BEGIN/END lines
- Replace `\n` with actual line breaks in Railway's interface
- Or keep `\n` if Railway accepts it as literal newlines

```bash
Variable Name: GOOGLE_SHEET_ID
Value: your-actual-google-sheet-id
```

#### 🤖 OpenAI API Configuration
```bash
Variable Name: OPENAI_API_KEY
Value: sk-proj-your-actual-openai-api-key
```

#### ⚙️ Application Configuration
```bash
Variable Name: NODE_ENV
Value: production
```

```bash
Variable Name: CRON_SCHEDULE
Value: 0 4 * * *
```

```bash
Variable Name: SCHEDULER_TIMEZONE
Value: Asia/Kolkata
```

```bash
Variable Name: DATABASE_PATH
Value: /app/data/birthday_messenger.db
```

```bash
Variable Name: WHATSAPP_TEST_MODE
Value: true
```
**💡 Tip:** Start with `true` for testing, change to `false` when ready for real messages

### Step 4: Save and Redeploy
1. After adding all variables, Railway should automatically redeploy
2. If not, look for a **"Deploy"** or **"Redeploy"** button
3. Wait for the deployment to complete

### Step 5: Verify Deployment
1. Check the **"Deployments"** tab for build status
2. Look at **"Logs"** to see if the application starts successfully
3. Visit your app URL: `https://your-app-name.railway.app/health`

## 📋 Quick Checklist

Before adding variables, make sure you have:
- [ ] Google Service Account created
- [ ] Google Service Account JSON key downloaded
- [ ] Google Sheets API enabled in your Google Cloud project
- [ ] Google Sheet shared with your service account email
- [ ] OpenAI API key from your OpenAI account
- [ ] Google Sheet ID from your sheet URL

## 🔍 How to Get Missing Information

### Google Service Account Email & Private Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Find your service account
4. Click **"Keys"** tab → **"Add Key"** → **"Create New Key"** → **JSON**
5. Download the JSON file
6. Extract `client_email` and `private_key` from the JSON

### Google Sheet ID:
From your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```
The `SHEET_ID_HERE` part is your Google Sheet ID

### OpenAI API Key:
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to **API Keys**
3. Create a new key or use existing one
4. Copy the key (starts with `sk-proj-`)

## 🎯 Expected Result

After configuring variables, your Railway logs should show:
```
✅ Application started successfully
✅ Environment variables loaded
✅ Database initialized
✅ Scheduler started
✅ Health check endpoint available at /health
```

## 🆘 Troubleshooting

### If deployment still fails:

1. **Check variable names** - Must match exactly (case-sensitive)
2. **Verify private key format** - Include BEGIN/END lines
3. **Test Google Sheets access** - Ensure sheet is shared with service account
4. **Validate OpenAI key** - Test in OpenAI playground
5. **Check Railway logs** - Look for specific error messages

### Common Issues:

**Private Key Format Error:**
- Make sure newlines are properly formatted
- Try both `\n` and actual line breaks
- Ensure no extra spaces or characters

**Google Sheets Access Error:**
- Verify service account email is correct
- Check if Google Sheet is shared with service account
- Ensure Google Sheets API is enabled

**OpenAI API Error:**
- Verify API key is valid and active
- Check if you have sufficient credits
- Ensure key has proper permissions

## 📞 Need Help?

If you're still having issues:
1. Check Railway's documentation: [docs.railway.app](https://docs.railway.app)
2. Look at the deployment logs for specific error messages
3. Verify each environment variable value locally first

---

**🎉 Once all variables are configured, your Birthday WhatsApp Messenger will start successfully on Railway!**