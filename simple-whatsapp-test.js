#!/usr/bin/env node

/**
 * Simple WhatsApp Test - Step by Step Guide
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator,
    WhatsAppClient
} = require('./dist/services');

async function simpleWhatsAppTest() {
    console.log('📱 Simple WhatsApp Authentication Test');
    console.log('='.repeat(50));
    console.log('');
    console.log('🎯 Goal: Send birthday message to Srinivas Reddy (+917396661509)');
    console.log('');
    console.log('📋 STEP-BY-STEP INSTRUCTIONS:');
    console.log('');
    console.log('1️⃣  Get your phone ready with WhatsApp open');
    console.log('2️⃣  Go to WhatsApp Settings > Linked Devices');
    console.log('3️⃣  Tap "Link a Device"');
    console.log('4️⃣  When QR code appears below, scan it IMMEDIATELY');
    console.log('5️⃣  Wait for "Authentication successful!" message');
    console.log('');
    console.log('⚠️  IMPORTANT: You have about 20 seconds per QR code');
    console.log('⚠️  If you miss it, the code will refresh automatically');
    console.log('');

    // Ask user if ready
    console.log('🤔 Are you ready with your phone? Press ENTER to continue...');

    // Wait for user input
    await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
    });

    try {
        // Initialize services quickly
        console.log('📊 Loading friend data...');
        const dbPath = process.env.DATABASE_PATH || './data/birthday_messenger.db';
        initializeDatabase(dbPath);

        const googleSheetsClient = new GoogleSheetsClient();
        await googleSheetsClient.authenticate();

        const dataLoader = new DataLoader(googleSheetsClient);
        const friends = await dataLoader.loadFriends();

        const srinivas = friends.find(f => f.whatsappNumber === '+917396661509');
        if (!srinivas) {
            console.log('❌ Srinivas not found in friends list');
            return;
        }

        console.log(`✅ Found: ${srinivas.name} (${srinivas.whatsappNumber})`);
        console.log('');
        console.log('🚀 Starting WhatsApp authentication...');
        console.log('');
        console.log('👀 WATCH FOR QR CODE BELOW:');
        console.log('='.repeat(50));

        const whatsappClient = new WhatsAppClient();

        // Set up authentication listener
        let authenticated = false;

        const authPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (!authenticated) {
                    reject(new Error('Authentication timeout'));
                }
            }, 180000); // 3 minutes total

            const checkAuth = async () => {
                try {
                    const isReady = await whatsappClient.isReady();
                    if (isReady && !authenticated) {
                        authenticated = true;
                        clearTimeout(timeout);
                        console.log('');
                        console.log('🎉 AUTHENTICATION SUCCESSFUL! 🎉');
                        console.log('');
                        resolve();
                    } else if (!authenticated) {
                        setTimeout(checkAuth, 1000); // Check every second
                    }
                } catch (error) {
                    // Continue checking
                    if (!authenticated) {
                        setTimeout(checkAuth, 1000);
                    }
                }
            };

            // Start checking after WhatsApp initializes
            setTimeout(checkAuth, 5000);
        });

        // Initialize WhatsApp
        await whatsappClient.initialize();

        // Wait for authentication
        await authPromise;

        // Generate and send message
        console.log('🤖 Generating Telugu birthday message...');
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();

        const message = await messageGenerator.generateMessage(srinivas);
        console.log('✅ Message ready:');
        console.log(`📄 "${message}"`);
        console.log('');

        console.log('📤 Sending message to Srinivas Reddy...');
        const result = await whatsappClient.sendMessage(srinivas.whatsappNumber, message);

        if (result.success) {
            console.log('');
            console.log('🎉🎉🎉 SUCCESS! MESSAGE SENT! 🎉🎉🎉');
            console.log('');
            console.log(`✅ Sent to: ${srinivas.name} (${srinivas.whatsappNumber})`);
            console.log(`📧 Message ID: ${result.messageId}`);
            console.log(`🌍 Language: Telugu`);
            console.log('');
            console.log('🎂 Srinivas should receive the birthday message now!');

        } else {
            console.log('❌ Failed to send message');
            console.log(`💥 Error: ${result.error}`);
        }

        await whatsappClient.disconnect();

    } catch (error) {
        console.error('');
        console.error('❌ Error:', error.message);
        console.error('');
        console.error('🔧 Try these solutions:');
        console.error('   • Make sure you scanned the QR code quickly');
        console.error('   • Check your phone\'s internet connection');
        console.error('   • Run: node cleanup-whatsapp.js');
        console.error('   • Try again with better timing');
    }
}

// Run the test
simpleWhatsAppTest().then(() => {
    console.log('');
    console.log('🎯 Test completed!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
});