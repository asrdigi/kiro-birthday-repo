#!/usr/bin/env node

/**
 * Send Birthday Message with Extended QR Code Time
 * Gives more time to scan QR code and authenticate
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator,
    WhatsAppClient
} = require('./dist/services');

async function sendMessageWithQR() {
    console.log('🎂 Send Birthday Message to Srinivas Reddy');
    console.log('='.repeat(50));

    try {
        // Initialize services
        console.log('📊 Initializing services...');
        const dbPath = process.env.DATABASE_PATH || './data/birthday_messenger.db';
        initializeDatabase(dbPath);

        const googleSheetsClient = new GoogleSheetsClient();
        await googleSheetsClient.authenticate();

        const dataLoader = new DataLoader(googleSheetsClient);
        const friends = await dataLoader.loadFriends();

        // Find Srinivas Reddy
        const srinivas = friends.find(f => f.whatsappNumber === '+917396661509');
        if (!srinivas) {
            console.log('❌ Srinivas Reddy (+917396661509) not found');
            return;
        }

        console.log('✅ Found target friend:');
        console.log(`   • Name: ${srinivas.name}`);
        console.log(`   • Phone: ${srinivas.whatsappNumber}`);
        console.log(`   • Language: ${srinivas.motherTongue}`);

        // Initialize WhatsApp Client
        console.log('');
        console.log('📱 Initializing WhatsApp Client...');
        console.log('');
        console.log('🔥 IMPORTANT INSTRUCTIONS:');
        console.log('   1. A QR code will appear below');
        console.log('   2. Open WhatsApp on your phone');
        console.log('   3. Go to Settings > Linked Devices');
        console.log('   4. Tap "Link a Device"');
        console.log('   5. Scan the QR code below');
        console.log('   6. Wait for "WhatsApp is ready!" message');
        console.log('');
        console.log('⏳ Starting WhatsApp client...');

        const whatsappClient = new WhatsAppClient();
        await whatsappClient.initialize();

        // Wait for client to be ready with longer timeout
        console.log('');
        console.log('⏳ Waiting for you to scan the QR code...');
        console.log('💡 You have 2 minutes to scan the code');

        let attempts = 0;
        const maxAttempts = 120; // 2 minutes

        while (attempts < maxAttempts) {
            const isReady = await whatsappClient.isReady();
            if (isReady) {
                console.log('');
                console.log('🎉 WhatsApp is ready! Authentication successful!');
                break;
            }

            attempts++;
            if (attempts % 10 === 0) { // Show progress every 10 seconds
                const remaining = Math.ceil((maxAttempts - attempts) / 60);
                console.log(`⏳ Still waiting... (${remaining} minutes remaining)`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const finalReady = await whatsappClient.isReady();
        if (!finalReady) {
            console.log('');
            console.log('❌ WhatsApp authentication timed out after 2 minutes');
            console.log('');
            console.log('🔧 Troubleshooting:');
            console.log('   • Make sure you scanned the QR code correctly');
            console.log('   • Check your phone\'s internet connection');
            console.log('   • Try running: node cleanup-whatsapp.js');
            console.log('   • Then run this script again');
            await whatsappClient.disconnect();
            return;
        }

        // Generate message
        console.log('');
        console.log('🤖 Generating birthday message...');
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();

        const message = await messageGenerator.generateMessage(srinivas);
        console.log('✅ Message generated:');
        console.log('');
        console.log('📄 Telugu Message:');
        console.log(`"${message}"`);
        console.log('');

        // Send message
        console.log('📤 Sending birthday message to Srinivas Reddy...');

        const result = await whatsappClient.sendMessage(srinivas.whatsappNumber, message);

        if (result.success) {
            console.log('');
            console.log('🎉🎉🎉 SUCCESS! 🎉🎉🎉');
            console.log('');
            console.log('✅ Birthday message sent successfully!');
            console.log(`📧 Message ID: ${result.messageId}`);
            console.log(`📱 Sent to: ${srinivas.whatsappNumber} (${srinivas.name})`);
            console.log(`🌍 Language: Telugu`);
            console.log('');
            console.log('🎂 The birthday message should appear in Srinivas\'s WhatsApp now!');
            console.log('');
            console.log('💡 If Srinivas still doesn\'t receive it, check:');
            console.log('   • Is +917396661509 his correct WhatsApp number?');
            console.log('   • Is his phone connected to the internet?');
            console.log('   • Does he have WhatsApp notifications enabled?');
            console.log('   • Has he blocked your WhatsApp number?');

        } else {
            console.log('');
            console.log('❌ Failed to send message');
            console.log(`💥 Error: ${result.error}`);
            console.log('');
            console.log('🔍 Possible solutions:');
            console.log('   • Verify +917396661509 is the correct number');
            console.log('   • Check if the number has WhatsApp installed');
            console.log('   • Try sending a manual test message first');
            console.log('   • Make sure your WhatsApp account can send messages');
        }

        // Cleanup
        console.log('');
        console.log('🧹 Disconnecting WhatsApp...');
        await whatsappClient.disconnect();

    } catch (error) {
        console.error('❌ Failed to send message:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the sender
sendMessageWithQR().then(() => {
    console.log('');
    console.log('🎯 Process completed!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
});