# Twilio WhatsApp Setup Guide

## Step 1: Create Twilio Account (5 minutes)

1. **Go to Twilio Sign Up**
   - Visit: https://www.twilio.com/try-twilio
   - Click "Sign up" or "Start for free"

2. **Fill in Registration Details**
   - First Name
   - Last Name
   - Email address
   - Password
   - Check "I'm not a robot"

3. **Verify Your Email**
   - Check your email inbox
   - Click the verification link from Twilio

4. **Verify Your Phone Number**
   - Enter your phone number
   - Receive and enter the verification code

5. **Complete Account Setup**
   - Select "Products" you're interested in (choose "Messaging")
   - Select your use case (choose "Alerts & Notifications")
   - Select your programming language (choose "Node.js")

## Step 2: Get Your Twilio Credentials (2 minutes)

1. **Access Twilio Console**
   - After login, you'll see the Twilio Console Dashboard
   - URL: https://console.twilio.com/

2. **Find Your Credentials**
   - On the dashboard, you'll see:
     - **Account SID**: Starts with "AC" (32 characters)
     - **Auth Token**: Click "Show" to reveal it
   
3. **Copy Your Credentials**
   ```
   Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Auth Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Step 3: Set Up WhatsApp Sandbox (3 minutes)

1. **Navigate to WhatsApp Sandbox**
   - In Twilio Console, go to: **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Or visit: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

2. **Join the Sandbox**
   - You'll see a sandbox number: **+1 415 523 8886**
   - You'll see a join code like: **join [word]-[word]**
   - Example: `join happy-dog`

3. **Send Join Message from Your Phone**
   - Open WhatsApp on your phone
   - Send a message to: **+1 415 523 8886**
   - Message content: **join [your-code]** (e.g., `join happy-dog`)
   - You'll receive a confirmation message

4. **Note Your Sandbox Number**
   ```
   Sandbox Number: whatsapp:+14155238886
   ```

## Step 4: Configure Your .env File (2 minutes)

1. **Open your .env file**
   ```bash
   cd kiro-birthday-project
   nano .env  # or use your preferred editor
   ```

2. **Update Twilio Configuration**
   ```bash
   # WhatsApp Configuration
   WHATSAPP_TEST_MODE=false  # Set to false for real Twilio API calls
   
   # Twilio WhatsApp API Configuration
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Your Account SID
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     # Your Auth Token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886             # Sandbox number
   TWILIO_SANDBOX_MODE=true                                # Using sandbox
   ```

3. **Save the file**

## Step 5: Test Your Setup (2 minutes)

1. **Rebuild the application**
   ```bash
   npm run build
   ```

2. **Run the test script**
   ```bash
   node test-today-birthdays.js
   ```

3. **Check your WhatsApp**
   - You should receive birthday messages on your phone
   - Messages will come from the Twilio sandbox number

## Step 6: Verify Message Delivery

1. **Check Twilio Console**
   - Go to: **Monitor** → **Logs** → **Messaging**
   - You'll see all sent messages with delivery status

2. **Check Message Details**
   - Click on any message to see:
     - Status (queued, sent, delivered, read)
     - Price (should be $0.00 in sandbox)
     - Error codes (if any)

## Important Notes

### Sandbox Limitations
- ✅ **Free**: No charges for sandbox messages
- ✅ **Testing**: Perfect for development and testing
- ⚠️ **Limited Recipients**: Only numbers that joined the sandbox can receive messages
- ⚠️ **Sandbox Prefix**: Messages include "Sent from your Twilio trial account" prefix

### Sandbox vs Production

| Feature | Sandbox | Production |
|---------|---------|------------|
| Cost | Free | ~$0.005 per message |
| Recipients | Only joined numbers | Any WhatsApp number |
| Message Prefix | "Sent from your Twilio trial account" | None |
| Setup Time | 5 minutes | 1-3 business days |
| Approval Required | No | Yes (business verification) |

## Troubleshooting

### Error: "Missing required Twilio environment variables"
**Solution**: Check that all three variables are set in .env:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WHATSAPP_FROM

### Error: "TWILIO_ACCOUNT_SID must start with AC"
**Solution**: Make sure you copied the Account SID correctly from Twilio Console

### Error: "TWILIO_WHATSAPP_FROM must be in format: whatsapp:+..."
**Solution**: Add the "whatsapp:" prefix to your number:
```bash
# Wrong
TWILIO_WHATSAPP_FROM=+14155238886

# Correct
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Error: "Authentication error" (Twilio error code 20003)
**Solution**: 
- Verify your Auth Token is correct
- Make sure there are no extra spaces in .env
- Try regenerating your Auth Token in Twilio Console

### Error: "Invalid phone number" (Twilio error code 21211)
**Solution**: 
- Ensure phone numbers are in E.164 format (+919876543210)
- Check that the recipient joined the sandbox (for sandbox testing)

### No Message Received
**Solution**:
1. Verify the recipient joined the sandbox (send "join [code]" to +1 415 523 8886)
2. Check Twilio Console logs for delivery status
3. Verify the phone number format in Google Sheets

## Next Steps

### For Production Use (Optional)

If you want to send messages to any WhatsApp number (not just sandbox):

1. **Request Production Access**
   - In Twilio Console: **Messaging** → **Senders** → **WhatsApp senders**
   - Click "Request to enable my Twilio numbers for WhatsApp"

2. **Complete Business Profile**
   - Business name
   - Business website
   - Business description
   - Use case description

3. **Wait for Approval** (1-3 business days)

4. **Get Production Number**
   - Purchase a Twilio phone number
   - Enable it for WhatsApp

5. **Update .env**
   ```bash
   TWILIO_WHATSAPP_FROM=whatsapp:+1234567890  # Your production number
   TWILIO_SANDBOX_MODE=false
   ```

### For Railway Deployment

Once sandbox testing is successful:

1. **Add Environment Variables to Railway**
   - Go to Railway dashboard
   - Select your project
   - Go to Variables tab
   - Add all Twilio variables

2. **Deploy**
   ```bash
   git add .
   git commit -m "Migrate to Twilio WhatsApp API"
   git push origin main
   ```

3. **Monitor Logs**
   - Check Railway logs for successful initialization
   - Verify messages are being sent

## Cost Estimation

### Sandbox (Current)
- **Cost**: $0.00 (Free)
- **Limit**: Only sandbox-joined numbers

### Production
- **Per Message**: $0.005 (₹0.42)
- **50 messages/year**: $0.25 (₹21)
- **100 messages/year**: $0.50 (₹42)
- **200 messages/year**: $1.00 (₹84)

**Well within your ₹100/year budget!**

## Support Resources

- **Twilio Documentation**: https://www.twilio.com/docs/whatsapp
- **Twilio Console**: https://console.twilio.com/
- **Twilio Support**: https://support.twilio.com/
- **WhatsApp Sandbox Guide**: https://www.twilio.com/docs/whatsapp/sandbox

---

**Ready to test?** Follow the steps above and you'll be sending WhatsApp messages via Twilio in about 15 minutes!
