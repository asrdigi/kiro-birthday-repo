#!/usr/bin/env node

/**
 * Debug WhatsApp Message Delivery
 * Investigates why messages aren't being delivered to specific numbers
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator,
    WhatsAppClient
} = require('./dist/services');

async function debugWhatsAppDelivery() {
    console.log('🔍 WhatsApp Message Delivery Debug');
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

        console.log(`✅ Loaded ${friends.length} friends`);

        // Find Srinivas Reddy
        const srinivas = friends.find(f => f.whatsappNumber === '+917396661509');
        if (!srinivas) {
            console.log('❌ Srinivas Reddy (+917396661509) not found in friends list');
            console.log('📋 Available friends:');
            friends.forEach(f => {
                console.log(`   • ${f.name}: ${f.whatsappNumber}`);
            });
            return;
        }

        console.log('');
        console.log('🎯 Target Friend Details:');
        console.log(`   • Name: ${srinivas.name}`);
        console.log(`   • Phone: ${srinivas.whatsappNumber}`);
        console.log(`   • Language: ${srinivas.motherTongue}`);
        console.log(`   • Birthday: ${srinivas.birthdate.toLocaleDateString()}`);

        // Initialize WhatsApp Client
        console.log('');
        console.log('📱 Initializing WhatsApp Client...');
        const whatsappClient = new WhatsAppClient();

        try {
            await whatsappClient.initialize();
            console.log('✅ WhatsApp Client initialized successfully');

            // Check if client is ready
            const isReady = await whatsappClient.isReady();
            console.log(`📊 WhatsApp Client Ready: ${isReady}`);

            if (!isReady) {
                console.log('⚠️  WhatsApp client is not ready. This could be why messages aren\'t being sent.');
                console.log('💡 Try running: node cleanup-whatsapp.js');
                console.log('💡 Then restart the application to re-authenticate');
                return;
            }

        } catch (error) {
            console.log(`❌ WhatsApp initialization failed: ${error.message}`);
            console.log('💡 This is likely why messages aren\'t being delivered');
            return;
        }

        // Generate message
        console.log('');
        console.log('🤖 Generating birthday message...');
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();

        const message = await messageGenerator.generateMessage(srinivas);
        console.log('✅ Message generated successfully');
        console.log(`📄 Message: "${message}"`);

        // Test message sending
        console.log('');
        console.log('📤 Testing message delivery...');

        try {
            const result = await whatsappClient.sendMessage(srinivas.whatsappNumber, message);

            if (result.success) {
                console.log('✅ Message sent successfully!');
                console.log(`📧 Message ID: ${result.messageId}`);
                console.log('');
                console.log('🔍 Possible reasons recipient hasn\'t received it:');
                console.log('   1. Phone number might be incorrect or inactive');
                console.log('   2. Recipient might have blocked your WhatsApp number');
                console.log('   3. Recipient\'s phone might be offline');
                console.log('   4. WhatsApp delivery delay (can take a few minutes)');
                console.log('   5. Recipient might not have WhatsApp installed');
                console.log('');
                console.log('💡 Verification steps:');
                console.log('   • Check if +917396661509 is the correct number');
                console.log('   • Verify the number has WhatsApp installed');
                console.log('   • Try sending a manual test message from your WhatsApp');
                console.log('   • Check if your WhatsApp account can send messages normally');

            } else {
                console.log('❌ Message sending failed!');
                console.log(`💥 Error: ${result.error}`);
                console.log('');
                console.log('🔍 Common causes of sending failures:');
                console.log('   1. Invalid phone number format');
                console.log('   2. Number not registered on WhatsApp');
                console.log('   3. WhatsApp rate limiting');
                console.log('   4. WhatsApp client connection issues');
            }

        } catch (error) {
            console.log('❌ Message sending threw an error!');
            console.log(`💥 Error: ${error.message}`);
        }

        // Cleanup
        console.log('');
        console.log('🧹 Cleaning up...');
        await whatsappClient.cleanup();

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

// Run the debug
debugWhatsAppDelivery().then(() => {
    console.log('');
    console.log('🎯 Debug complete!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
});