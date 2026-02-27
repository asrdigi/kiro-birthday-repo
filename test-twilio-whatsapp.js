#!/usr/bin/env node

/**
 * Test script for Twilio WhatsApp integration
 * 
 * This script tests the Twilio WhatsApp API by:
 * 1. Initializing the Twilio client
 * 2. Sending a test message to your phone number
 * 3. Checking message delivery status
 * 
 * Prerequisites:
 * - Twilio account with WhatsApp enabled
 * - Environment variables set in .env:
 *   - TWILIO_ACCOUNT_SID
 *   - TWILIO_AUTH_TOKEN
 *   - TWILIO_WHATSAPP_FROM
 * 
 * For sandbox testing:
 * - Join Twilio WhatsApp sandbox first
 * - Send "join [your-code]" to Twilio's WhatsApp number
 * 
 * Usage:
 *   node test-twilio-whatsapp.js
 *   node test-twilio-whatsapp.js +919848356478
 */

require('dotenv').config();
const path = require('path');

// Check if TypeScript files need to be compiled
const fs = require('fs');
const distPath = path.join(__dirname, 'dist', 'services', 'TwilioWhatsAppClient.js');

if (!fs.existsSync(distPath)) {
    console.log('📦 Compiling TypeScript files...');
    require('child_process').execSync('npm run build', { stdio: 'inherit' });
}

const { TwilioWhatsAppClient } = require('./dist/services/TwilioWhatsAppClient');

async function testTwilioWhatsApp() {
    console.log('🧪 Testing Twilio WhatsApp Integration\n');
    console.log('='.repeat(60));

    // Check environment variables
    console.log('\n📋 Checking environment variables...');
    const requiredVars = [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_WHATSAPP_FROM'
    ];

    const missing = requiredVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('\n❌ Missing required environment variables:');
        missing.forEach(key => console.error(`   - ${key}`));
        console.error('\nPlease add these to your .env file:');
        console.error('TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        console.error('TWILIO_AUTH_TOKEN=your_auth_token_here');
        console.error('TWILIO_WHATSAPP_FROM=whatsapp:+14155238886');
        process.exit(1);
    }

    console.log('✅ All required environment variables are set');
    console.log(`   Account SID: ${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
    console.log(`   From Number: ${process.env.TWILIO_WHATSAPP_FROM}`);

    // Get test phone number
    const testNumber = process.argv[2] || process.env.TEST_PHONE_NUMBER || '+919848356478';
    console.log(`\n📱 Test phone number: ${testNumber}`);

    try {
        // Initialize Twilio client
        console.log('\n🔧 Initializing Twilio WhatsApp client...');
        const client = new TwilioWhatsAppClient();
        await client.initialize();
        console.log('✅ Client initialized successfully');

        // Check if client is ready
        const isReady = await client.isReady();
        console.log(`✅ Client ready status: ${isReady}`);

        // Send test message
        console.log('\n📤 Sending test message...');
        const testMessage = `🎉 Hello from Birthday Messenger!

This is a test message from your autonomous birthday messenger application.

✅ Twilio WhatsApp API is working correctly!
✅ Your app can now run fully autonomously on Railway cloud!

Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;

        const messageId = await client.sendMessage(testNumber, testMessage);
        console.log('✅ Message sent successfully!');
        console.log(`   Message ID: ${messageId}`);

        // Wait a bit and check message status
        console.log('\n⏳ Waiting 3 seconds to check delivery status...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        const status = await client.getMessageStatus(messageId);
        console.log(`📊 Message status: ${status}`);

        // Status meanings
        const statusMeanings = {
            'queued': '⏳ Message is queued for sending',
            'sending': '📤 Message is being sent',
            'sent': '✅ Message sent to WhatsApp',
            'delivered': '✅ Message delivered to recipient',
            'read': '✅ Message read by recipient',
            'failed': '❌ Message failed to send',
            'undelivered': '❌ Message could not be delivered'
        };

        console.log(`   ${statusMeanings[status] || status}`);

        // Disconnect
        await client.disconnect();
        console.log('\n✅ Client disconnected');

        // Success summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SUCCESS! Twilio WhatsApp integration is working!');
        console.log('='.repeat(60));
        console.log('\n✅ Next steps:');
        console.log('   1. Check your WhatsApp for the test message');
        console.log('   2. Update Railway environment variables:');
        console.log('      - WHATSAPP_PROVIDER=twilio');
        console.log('      - TWILIO_ACCOUNT_SID=your_sid');
        console.log('      - TWILIO_AUTH_TOKEN=your_token');
        console.log('      - TWILIO_WHATSAPP_FROM=whatsapp:+14155238886');
        console.log('   3. Deploy to Railway for autonomous operation!');
        console.log('\n💡 Your app will now run 24/7 without needing your computer!\n');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\n🔍 Troubleshooting:');

        if (error.message.includes('authentication')) {
            console.error('   - Check your Twilio Account SID and Auth Token');
            console.error('   - Make sure they are correct in your .env file');
        } else if (error.message.includes('sandbox')) {
            console.error('   - Make sure you joined the Twilio WhatsApp sandbox');
            console.error('   - Send "join [your-code]" to Twilio\'s WhatsApp number');
            console.error('   - Example: "join happy-elephant" to +14155238886');
        } else if (error.message.includes('phone number')) {
            console.error('   - Check the phone number format: +919848356478');
            console.error('   - Make sure it includes country code');
        } else {
            console.error('   - Check Twilio console for more details');
            console.error('   - Visit: https://console.twilio.com/');
        }

        console.error('\n📚 Documentation:');
        console.error('   - Twilio WhatsApp: https://www.twilio.com/docs/whatsapp');
        console.error('   - Migration Guide: ./TWILIO-MIGRATION-GUIDE.md');

        process.exit(1);
    }
}

// Run the test
testTwilioWhatsApp().catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
});
