# 🔒 Security Guide for Railway Deployment

## 🛡️ Environment Variables Security

### Railway's Security Measures:
- ✅ **Encrypted at rest** - Variables stored encrypted in Railway's database
- ✅ **Encrypted in transit** - HTTPS/TLS for all communications
- ✅ **Access control** - Only authorized team members can view variables
- ✅ **Audit logging** - Track who accesses or modifies variables
- ✅ **No code exposure** - Variables never appear in source code or logs
- ✅ **Runtime injection** - Variables securely injected at application startup

## 🔐 Security Best Practices

### 1. API Key Management

**Google Service Account:**
```bash
# ✅ GOOD: Use dedicated service account with minimal permissions
GOOGLE_SERVICE_ACCOUNT_EMAIL=birthday-app@your-project.iam.gserviceaccount.com

# ❌ AVOID: Using personal Google account or overprivileged accounts
```

**OpenAI API Key:**
```bash
# ✅ GOOD: Use project-specific API key with usage limits
OPENAI_API_KEY=sk-proj-...

# 💡 TIP: Set usage limits in OpenAI dashboard to prevent abuse
```

### 2. Access Control

**Railway Project Settings:**
- ✅ **Limit team members** - Only add necessary people to your Railway project
- ✅ **Use role-based access** - Give minimum required permissions
- ✅ **Regular audits** - Review team members periodically
- ✅ **Remove unused access** - Remove team members who no longer need access

### 3. Environment Separation

**Use different credentials for different environments:**
```bash
# Development
OPENAI_API_KEY=sk-proj-dev-key-here
GOOGLE_SHEET_ID=development-sheet-id

# Production  
OPENAI_API_KEY=sk-proj-prod-key-here
GOOGLE_SHEET_ID=production-sheet-id
```

### 4. Monitoring and Alerts

**Set up monitoring for:**
- ✅ **Unusual API usage** - Monitor OpenAI and Google API usage
- ✅ **Failed authentication** - Watch for authentication errors
- ✅ **Deployment changes** - Get notified of environment variable changes
- ✅ **Access logs** - Review who accesses your Railway project

## 🚨 Security Checklist

### Before Deployment:
- [ ] **Rotate default keys** - Don't use development keys in production
- [ ] **Set API limits** - Configure usage limits in OpenAI dashboard
- [ ] **Restrict Google Sheet access** - Only share with service account
- [ ] **Review team access** - Ensure only necessary people have Railway access
- [ ] **Enable 2FA** - Use two-factor authentication on all accounts

### After Deployment:
- [ ] **Monitor usage** - Check API usage regularly
- [ ] **Review logs** - Look for suspicious activity
- [ ] **Update dependencies** - Keep packages updated for security patches
- [ ] **Backup data** - Regular backups of your Google Sheet data
- [ ] **Test security** - Verify environment variables aren't exposed

## 🔄 Key Rotation Strategy

**Rotate keys regularly:**

### Monthly Rotation:
1. **Generate new API keys**
2. **Update Railway environment variables**
3. **Test application functionality**
4. **Revoke old keys**
5. **Document rotation in audit log**

### Emergency Rotation (if compromised):
1. **Immediately revoke compromised keys**
2. **Generate new keys**
3. **Update Railway variables**
4. **Redeploy application**
5. **Monitor for unauthorized usage**

## 🛠️ Security Tools and Commands

### Check Environment Variable Security:
```bash
# Verify no secrets in code
git log --all --full-history -- "*.env*"
grep -r "sk-" . --exclude-dir=node_modules
grep -r "AIza" . --exclude-dir=node_modules
```

### Monitor API Usage:
```bash
# OpenAI usage monitoring
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage

# Google API quota monitoring  
# Check in Google Cloud Console → APIs & Services → Quotas
```

## 🚫 What NOT to Do

### ❌ Security Anti-Patterns:
- **Never commit .env files** with real credentials to Git
- **Don't share API keys** via email, Slack, or other channels
- **Avoid hardcoding secrets** in source code
- **Don't use production keys** for development/testing
- **Never log sensitive data** in application logs
- **Don't share Railway project access** unnecessarily

### ❌ Common Mistakes:
```bash
# DON'T DO THIS:
console.log('API Key:', process.env.OPENAI_API_KEY); // Logs secret!
const apiKey = 'sk-proj-hardcoded-key'; // Hardcoded secret!
git add .env # Commits secrets to Git!
```

## 🔍 Security Monitoring

### Railway Dashboard Monitoring:
1. **Go to Railway Dashboard**
2. **Check "Activity" tab** - Review recent changes
3. **Monitor "Metrics" tab** - Watch for unusual resource usage
4. **Review "Logs" tab** - Look for authentication errors

### External Monitoring:
- **OpenAI Dashboard** - Monitor API usage and costs
- **Google Cloud Console** - Check API quotas and usage
- **GitHub Security** - Enable security alerts for dependencies

## 🆘 Incident Response

### If You Suspect a Security Breach:

1. **Immediate Actions:**
   - Revoke all API keys immediately
   - Change Railway account password
   - Enable 2FA if not already enabled
   - Remove suspicious team members

2. **Investigation:**
   - Check Railway activity logs
   - Review API usage patterns
   - Examine application logs for anomalies
   - Check Google Sheet access logs

3. **Recovery:**
   - Generate new API keys
   - Update environment variables
   - Redeploy application
   - Monitor for continued suspicious activity

4. **Prevention:**
   - Implement additional monitoring
   - Review and tighten access controls
   - Update security procedures
   - Document lessons learned

## 📞 Security Contacts

### Report Security Issues:
- **Railway Security**: security@railway.app
- **OpenAI Security**: security@openai.com  
- **Google Cloud Security**: https://cloud.google.com/security/report-vulnerability

## 🎯 Security Summary

**Railway environment variables are secure when:**
- ✅ You follow access control best practices
- ✅ You rotate keys regularly
- ✅ You monitor usage and access
- ✅ You keep dependencies updated
- ✅ You don't expose secrets in code or logs

**Your birthday messenger application has:**
- 🔒 **Encrypted storage** of all sensitive data
- 🛡️ **Secure transmission** of API requests
- 👥 **Controlled access** to environment variables
- 📊 **Audit trails** for all changes
- 🔄 **Easy key rotation** capabilities

Railway provides enterprise-grade security that's suitable for production applications handling sensitive data like API keys and personal information.