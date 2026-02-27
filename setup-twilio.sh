#!/bin/bash

# Twilio WhatsApp Setup Script
# This script helps you set up Twilio WhatsApp API for autonomous cloud deployment

set -e  # Exit on error

echo "🚀 Twilio WhatsApp Setup Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the kiro-birthday-project directory"
    exit 1
fi

echo "📦 Step 1: Installing Twilio SDK..."
npm install twilio
npm install @types/twilio --save-dev
echo "✅ Twilio SDK installed"
echo ""

echo "📋 Step 2: Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found, creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
fi
echo ""

echo "🔧 Step 3: Configuration needed"
echo "================================"
echo ""
echo "Please complete these steps:"
echo ""
echo "1. Create Twilio Account:"
echo "   → Visit: https://www.twilio.com/try-twilio"
echo "   → Sign up and get \$15 free credit"
echo ""
echo "2. Join WhatsApp Sandbox:"
echo "   → Go to: Messaging → Try it out → Send a WhatsApp message"
echo "   → Send 'join [your-code]' to Twilio's WhatsApp number"
echo "   → Example: 'join happy-elephant' to +14155238886"
echo ""
echo "3. Get Your Credentials:"
echo "   → From Twilio Console, copy:"
echo "     - Account SID (starts with AC...)"
echo "     - Auth Token (click to reveal)"
echo ""
echo "4. Update .env file:"
echo "   → Add these lines to your .env file:"
echo ""
echo "   WHATSAPP_PROVIDER=twilio"
echo "   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
echo "   TWILIO_AUTH_TOKEN=your_auth_token_here"
echo "   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886"
echo "   WHATSAPP_TEST_MODE=false"
echo ""
echo "5. Build and Test:"
echo "   → Run: npm run build"
echo "   → Run: node test-twilio-whatsapp.js +919848356478"
echo ""
echo "6. Deploy to Railway:"
echo "   → Add the same environment variables in Railway dashboard"
echo "   → Deploy will happen automatically"
echo ""
echo "================================"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: TWILIO-QUICK-START.md"
echo "   - Full Guide: TWILIO-MIGRATION-GUIDE.md"
echo "   - Summary: AUTONOMOUS-DEPLOYMENT-SUMMARY.md"
echo ""
echo "✅ Setup script completed!"
echo ""
echo "Next: Follow the steps above to complete your Twilio configuration"
