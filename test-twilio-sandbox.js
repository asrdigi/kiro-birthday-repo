#!/usr/bin/env node

/**
 * Twilio Sandbox Test Script
 * Tests sending a WhatsApp message via Twilio sandbox
 * 
 * Prerequisites:
 * 1. Twilio account created
 * 2. WhatsApp sandbox joined (send "join [code]" to +1 415 523 8886)
 * 3. .env configured with Twilio credentials
 */

require('dotenv').config();

async function testTwilioSandbox() {
    console.log('🧪 Twilio WhatsApp Sandbox Test');
    console.log('='.repeat(60));
    console.log('');

    // Check environment variables
    console.log('📋 Checking environment variables...');
    const requiredVars = [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_WHATSAPP_FROM'
    ];

    const missing = requiredVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(v => console.error(`   • ${v}`));
        console.error('');
        console.error('📖 Please follow TWILIO-SETUP-GUIDE.md to set up your credentials');
        process.exit(1);
    }

    console.log('✅ All environment variables present');
    console.log('');

    // Display configuration (redacted)
    console.log('🔧 Configuration:');
    console.log(`   Account SID: ${process.env.TWILIO_ACCOUNT_SID?.substring(0, 10)}...`);
    console.log(`   Auth Token: ${process.env.TWILIO_AUTH_TOKEN?.substring(0, 10)}...`);
    console.log(`   From Number: ${process.env.TWILIO_WHATSAPP_FROM}`);
    console.log(`   Test Mode: ${process.env.WHATSAPP_TEST_MODE}`);
    console.log(`   Sandbox Mode: ${process.env.TWILIO_SANDBOX_MODE}`);
    console.log('');

    // Prompt for test phone number
    console.log('📱 Test Phone Number:');
    console.log('   Enter the phone number that joined the sandbox');
    console.log('   Format: +[country code][number]');
    console.log('   Example: +919876543210');
    console.log('');
    console.log('   ⚠️  Make sure this number has joined the sandbox by sending');
    console.log('      "join [code]" to +1 415 523 8886 on WhatsApp');
    console.log('');

    // Get phone number from command line argument
    const testNumber = process.argv[2];

    if (!testNumber) {
        console.error('❌ Please provide a phone number as argument');
        console.error('');
        console.error('Usage: node test-twilio-sandbox.js +919876543210');
        console.error('');
        process.exit(1);
    }

    console.log(`   Using number: ${testNumber}`);
    console.log('');

    try {
        // Import TwilioWhatsAppClient
        const { TwilioWhatsAppClient } = require('./dist/services/TwilioWhatsAppClient');

        console.log('🚀 Initializing Twilio WhatsApp client...');
        const client = new TwilioWhatsAppClient();
        await client.initialize();
        console.log('✅ Client initialized successfully');
        console.log('');

        // Check if ready
        console.log('🔍 Checking if client is ready...');
        const isReady = await client.isReady();

        if (!isReady) {
            throw new Error('Client is not ready');
        }

        console.log('✅ Client is ready');
        console.log('');

        // Send test message
        console.log('📤 Sending test message...');
        const testMessage = `🎉 Hello from Twilio WhatsApp API!

This is a test message from your Birthday WhatsApp Messenger application.

✅ If you received this message, your Twilio integration is working correctly!

Timestamp: ${new Date().toLocaleString()}`;

        const result = await client.sendMessage(testNumber, testMessage);
        console.log('');

        if (result.success) {
            console.log('✅ Message sent successfully!');
            console.log('');
            console.log('📊 Message Details:');
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Timestamp: ${result.timestamp}`);
            if (result.twilioStatus) {
                console.log(`   Twilio Status: ${result.twilioStatus}`);
            }
            if (result.price) {
                console.log(`   Cost: ${result.price} ${result.priceUnit}`);
            }
            console.log('');
            console.log('📱 Check your WhatsApp to verify the message was received!');
            console.log('');
            console.log('🔍 You can also check Twilio Console:');
            console.log('   https://console.twilio.com/us1/monitor/logs/messaging');
            console.log('');
            console.log('🎉 Twilio integration is working correctly!');
        } else {
            console.error('❌ Message sending failed');
            console.error('');
            console.error('Error Details:');
            console.error(`   Error: ${result.error}`);
            if (result.errorCode) {
                console.error(`   Error Code: ${result.errorCode}`);
            }
            console.error('');
            console.error('💡 Troubleshooting:');
            console.error('   1. Verify the phone number joined the sandbox');
            console.error('   2. Check phone number format (+country code + number)');
            console.error('   3. Verify Twilio credentials are correct');
            console.error('   4. Check Twilio Console for more details');
            console.error('');
            process.exit(1);
        }

        // Disconnect
        await client.disconnect();

    } catch (error) {
        console.error('');
        console.error('❌ Test failed:', error.message);
        console.error('');

        if (error.message.includes('Missing required')) {
            console.error('💡 Solution: Update your .env file with Twilio credentials');
            console.error('   See TWILIO-SETUP-GUIDE.md for instructions');
        } else if (error.message.includes('Authentication')) {
            console.error('💡 Solution: Verify your Twilio credentials');
            console.error('   1. Check TWILIO_ACCOUNT_SID starts with "AC"');
            console.error('   2. Verify TWILIO_AUTH_TOKEN is correct');
            console.error('   3. Try regenerating Auth Token in Twilio Console');
        } else {
            console.error('💡 Check the error message above for details');
            console.error('   See TWILIO-SETUP-GUIDE.md for troubleshooting');
        }

        console.error('');
        process.exit(1);
    }
}

// Run test
testTwilioSandbox().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
