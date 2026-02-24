#!/usr/bin/env node

/**
 * Send Birthday Message to Srinivas Reddy
 * Specifically targets +917396661509 for message delivery
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator,
    WhatsAppClient
} = require('./dist/services');

async function sendToSrinivas() {
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
        console.log('⏳ Please scan the QR code with your phone when it appears...');

        const whatsappClient = new WhatsAppClient();
        await whatsappClient.initialize();

        // Wait for client to be ready
        console.log('⏳ Waiting for WhatsApp to be ready...');
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds

        while (attempts < maxAttempts) {
            const isReady = await whatsappClient.isReady();
            if (isReady) {
                console.log('✅ WhatsApp is ready!');
                break;
            }

            attempts++;
            console.log(`⏳ Waiting... (${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const finalReady = await whatsappClient.isReady();
        if (!finalReady) {
            console.log('❌ WhatsApp client is still not ready after 30 seconds');
            console.log('💡 Make sure you scanned the QR code with your phone');
            console.log('💡 Try running this script again');
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
        console.log(`📄 "${message}"`);

        // Send message
        console.log('');
        console.log('📤 Sending birthday message...');

        const result = await whatsappClient.sendMessage(srinivas.whatsappNumber, message);

        if (result.success) {
            console.log('🎉 SUCCESS! Message sent to Srinivas Reddy!');
            console.log(`📧 Message ID: ${result.messageId}`);
            console.log(`📱 Sent to: ${srinivas.whatsappNumber}`);
            console.log('');
            console.log('✅ The message should appear in Srinivas\'s WhatsApp within a few seconds');
            console.log('💡 If he still doesn\'t receive it, check:');
            console.log('   • Is +917396661509 the correct number?');
            console.log('   • Does he have WhatsApp installed?');
            console.log('   • Is his phone connected to internet?');
            console.log('   • Has he blocked your WhatsApp number?');

        } else {
            console.log('❌ Failed to send message');
            console.log(`💥 Error: ${result.error}`);
            console.log('');
            console.log('🔍 Possible solutions:');
            console.log('   • Verify the phone number is correct');
            console.log('   • Check if the number has WhatsApp');
            console.log('   • Try sending a manual message first');
        }

        // Cleanup
        console.log('');
        console.log('🧹 Cleaning up...');
        await whatsappClient.disconnect();

    } catch (error) {
        console.error('❌ Failed to send message:', error.message);
    }
}

// Run the sender
sendToSrinivas().then(() => {
    console.log('');
    console.log('🎯 Done!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
});