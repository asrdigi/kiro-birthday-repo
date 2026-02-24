# 🚀 Railway Deployment Guide

Deploy your Birthday WhatsApp Messenger to Railway cloud platform for 24/7 operation.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your production environment variables

## 🔧 Step 1: Prepare Your Repository

1. **Commit all changes:**
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

2. **Verify files are ready:**
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Process definition
- ✅ `.env.production` - Production environment template
- ✅ `src/railway-app.ts` - Railway-optimized entry point

## 🚀 Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Go to Railway Dashboard:**
   - Visit [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"

2. **Connect Repository:**
   - Authorize Railway to access your GitHub
   - Select your birthday messenger repository
   - Click "Deploy Now"

### Option B: Deploy with Railway CLI

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and deploy:**
```bash
railway login
railway init
railway up
```

## ⚙️ Step 3: Configure Environment Variables

In Railway Dashboard, go to your project → Variables tab and add:

### Required Variables:
```bash
# Google Sheets API (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
GOOGLE_SHEET_ID=your-google-sheet-id

# OpenAI API
OPENAI_API_KEY=sk-proj-your-openai-api-key

# WhatsApp Configuration
WHATSAPP_TEST_MODE=false
COMPLETE_TEST_MODE=false

# Scheduler Configuration
CRON_SCHEDULE=0 4 * * *
SCHEDULER_TIMEZONE=Asia/Kolkata

# Railway Configuration
NODE_ENV=production
DATABASE_PATH=/app/data/birthday_messenger.db
```

### Optional Variables:
```bash
# Logging
LOG_LEVEL=info
LOG_TO_FILE=true

# Custom Port (Railway auto-assigns)
PORT=3000
```

## 📊 Step 4: Verify Deployment

### Check Health Status:
1. **Open your Railway app URL**
2. **Visit health endpoints:**
   - `https://your-app.railway.app/health` - Basic health check
   - `https://your-app.railway.app/status` - Detailed status

### Expected Response:
```json
{
  "status": "healthy",
  "service": "Birthday WhatsApp Messenger",
  "timestamp": "2026-02-24T18:30:00.000Z",
  "uptime": 3600,
  "scheduler": "running",
  "environment": "production"
}
```

## 🔍 Step 5: Monitor and Debug

### View Logs:
```bash
# Using Railway CLI
railway logs

# Or in Railway Dashboard
# Go to your project → Deployments → View Logs
```

### Common Issues and Solutions:

#### 1. Build Failures:
```bash
# Check if all dependencies are in package.json
npm install
npm run build

# Verify TypeScript compilation
npx tsc --noEmit
```

#### 2. Environment Variable Issues:
- Ensure all required variables are set in Railway Dashboard
- Check for typos in variable names
- Verify Google Service Account key format (newlines as \n)

#### 3. WhatsApp Authentication:
- WhatsApp Web linking may not work in cloud environments
- Consider using WhatsApp Business API for production
- Monitor logs for authentication errors

#### 4. Database Issues:
- Railway provides persistent storage at `/app/data/`
- Database will be created automatically on first run
- Check logs for database initialization errors

## 📱 Step 6: WhatsApp Setup for Production

### Important Notes:
- **WhatsApp Web linking requires manual QR scanning**
- **Cloud environments may have limitations with WhatsApp Web**
- **Consider WhatsApp Business API for production use**

### Alternative Approaches:
1. **Use Test Mode initially:**
   - Set `WHATSAPP_TEST_MODE=true`
   - Monitor message generation and scheduling
   - Switch to real mode when ready

2. **WhatsApp Business API:**
   - More reliable for production
   - Requires WhatsApp Business account
   - No QR code scanning needed

## 🔄 Step 7: Continuous Deployment

Railway automatically redeploys when you push to your connected GitHub repository:

```bash
# Make changes locally
git add .
git commit -m "Update birthday messenger"
git push origin main

# Railway will automatically redeploy
```

## 📈 Step 8: Scaling and Monitoring

### Railway Features:
- **Auto-scaling**: Railway handles traffic automatically
- **Metrics**: Monitor CPU, memory, and network usage
- **Alerts**: Set up notifications for issues
- **Logs**: Real-time log streaming

### Monitoring Checklist:
- ✅ Daily scheduler execution at 4 AM IST
- ✅ Successful Google Sheets data loading
- ✅ Message generation working
- ✅ WhatsApp authentication status
- ✅ Database operations

## 🛠️ Troubleshooting

### Debug Commands:
```bash
# Check deployment status
railway status

# View recent logs
railway logs --tail

# Connect to deployment shell
railway shell
```

### Health Check URLs:
- **Basic Health**: `https://your-app.railway.app/health`
- **Detailed Status**: `https://your-app.railway.app/status`

### Common Solutions:
1. **Restart deployment**: Railway Dashboard → Deployments → Restart
2. **Check environment variables**: Variables tab in Railway Dashboard
3. **Review logs**: Look for error messages and stack traces
4. **Test locally first**: Ensure everything works locally before deploying

## 🎯 Production Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Google Sheets API working
- [ ] OpenAI API key valid
- [ ] WhatsApp authentication method decided
- [ ] Scheduler timezone set correctly (Asia/Kolkata)
- [ ] Health checks responding
- [ ] Logs showing successful initialization
- [ ] Test mode disabled (`WHATSAPP_TEST_MODE=false`)

## 💡 Tips for Success

1. **Start with Test Mode**: Deploy with `WHATSAPP_TEST_MODE=true` first
2. **Monitor Logs**: Watch logs during first few runs
3. **Gradual Rollout**: Test with a small group first
4. **Backup Strategy**: Keep local backups of your friend data
5. **Regular Updates**: Keep dependencies updated for security

Your Birthday WhatsApp Messenger is now running 24/7 on Railway! 🎉