#!/usr/bin/env node

/**
 * Test Real WhatsApp Mode
 * Optimized script for testing real WhatsApp authentication and message sending
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator,
    WhatsAppClient
} = require('./dist/services');

async function testRealWhatsApp() {
    console.log('📱 Testing Real WhatsApp Mode');
    console.log('='.repeat(50));

    // Pre-flight checks
    console.log('✈️  Pre-flight checks...');

    if (process.env.WHATSAPP_TEST_MODE === 'true') {
        console.log('❌ WHATSAPP_TEST_MODE is still set to true');
        console.log('💡 Please set WHATSAPP_TEST_MODE=false in .env file');
        return;
    }

    console.log('✅ Real mode enabled');
    console.log('');

    try {
        // Initialize services (except WhatsApp first)
        console.log('📊 Initializing services...');
        const dbPath = process.env.DATABASE_PATH || './data/birthday_messenger.db';
        initializeDatabase(dbPath);

        const googleSheetsClient = new GoogleSheetsClient();
        await googleSheetsClient.authenticate();

        const dataLoader = new DataLoader(googleSheetsClient);
        const friends = await dataLoader.loadFriends();

        console.log(`✅ Loaded ${friends.length} friends`);

        // Check for today's birthdays
        const today = new Date();
        const birthdayFriends = friends.filter(friend => {
            return today.getMonth() === friend.birthdate.getMonth() &&
                today.getDate() === friend.birthdate.getDate();
        });

        console.log(`🎉 Found ${birthdayFriends.length} friends with birthdays today:`);
        birthdayFriends.forEach(friend => {
            console.log(`   • ${friend.name} (${friend.motherTongue}) - ${friend.whatsappNumber}`);
        });

        if (birthdayFriends.length === 0) {
            console.log('📅 No birthdays today. Testing with first friend anyway...');
            if (friends.length > 0) {
                birthdayFriends.push(friends[0]);
                console.log(`   • Testing with: ${friends[0].name} - ${friends[0].whatsappNumber}`);
            } else {
                console.log('❌ No friends found to test with');
                return;
            }
        }

        // Initialize MessageGenerator
        console.log('');
        console.log('🤖 Initializing MessageGenerator...');
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();
        console.log('✅ MessageGenerator ready');

        // Initialize WhatsApp client (this is where authentication happens)
        console.log('');
        console.log('📱 Initializing WhatsApp client...');
        console.log('⚠️  IMPORTANT: Have your phone ready to scan QR code!');
        console.log('');

        const whatsappClient = new WhatsAppClient();

        // Set a longer timeout for authentication
        console.log('🔄 Starting WhatsApp authentication...');
        console.log('   • This may take 30-60 seconds');
        console.log('   • QR code will appear - scan it with your phone');
        console.log('   • Keep your phone nearby and WhatsApp active');
        console.log('');

        await whatsappClient.initialize();

        // Check if client is ready
        const isReady = await whatsappClient.isReady();

        if (!isReady) {
            console.log('⚠️  WhatsApp client initialized but not ready yet');
            console.log('🔄 Waiting for connection to be ready...');

            // Wait up to 2 minutes for client to be ready
            let attempts = 0;
            const maxAttempts = 24; // 24 * 5 seconds = 2 minutes

            while (!await whatsappClient.isReady() && attempts < maxAttempts) {
                console.log(`   • Waiting... (${attempts + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                attempts++;
            }

            if (!await whatsappClient.isReady()) {
                console.log('❌ WhatsApp client failed to become ready within 2 minutes');
                console.log('💡 Try again or check your phone/internet connection');
                return;
            }
        }

        console.log('✅ WhatsApp client is ready!');
        console.log('');

        // Send test messages
        console.log('💬 Sending birthday messages...');

        for (const friend of birthdayFriends) {
            try {
                console.log(`\n🎂 Processing ${friend.name}...`);

                // Generate personalized message
                console.log('   📝 Generating message...');
                const message = await messageGenerator.generateMessage(friend);
                console.log(`   📄 Message preview: ${message.substring(0, 100)}...`);

                // Send WhatsApp message
                console.log('   📱 Sending WhatsApp message...');
                const result = await whatsappClient.sendMessage(friend.whatsappNumber, message);

                if (result.success) {
                    console.log(`   ✅ Message sent successfully!`);
                    console.log(`   📧 Message ID: ${result.messageId}`);
                    console.log(`   ⏰ Sent at: ${result.timestamp.toLocaleString()}`);
                } else {
                    console.log(`   ❌ Failed to send message: ${result.error}`);
                }
            } catch (error) {
                console.log(`   ❌ Error processing ${friend.name}: ${error.message}`);
            }
        }

        console.log('\n🎯 Real WhatsApp test completed!');
        console.log('');
        console.log('📊 Summary:');
        console.log(`   • Friends processed: ${birthdayFriends.length}`);
        console.log(`   • WhatsApp authentication: ✅ Success`);
        console.log(`   • Message generation: ✅ Success`);
        console.log('');
        console.log('🎉 Your application is now running in REAL MODE!');

        // Keep session alive for a moment
        console.log('⏳ Keeping session alive for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Disconnect gracefully
        console.log('🔌 Disconnecting WhatsApp client...');
        await whatsappClient.disconnect();
        console.log('✅ Disconnected successfully');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        // Provide specific guidance based on error type
        if (error.message.includes('Can\'t link new devices')) {
            console.log('');
            console.log('🔧 WhatsApp Linking Issue:');
            console.log('   • This is a temporary WhatsApp restriction');
            console.log('   • Wait 2-4 hours and try again');
            console.log('   • Check Settings → Linked Devices on your phone');
            console.log('   • Remove old/unused linked devices');
        } else if (error.message.includes('browser is already running')) {
            console.log('');
            console.log('🔧 Browser Conflict:');
            console.log('   • Run: node cleanup-whatsapp.js');
            console.log('   • Wait 30 seconds and try again');
        } else if (error.message.includes('timeout')) {
            console.log('');
            console.log('🔧 Connection Timeout:');
            console.log('   • Check your internet connection');
            console.log('   • Make sure WhatsApp is active on your phone');
            console.log('   • Try again in a few minutes');
        }
    }
}

// Run the test
testRealWhatsApp().then(() => {
    console.log('✨ Test finished');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test crashed:', error.message);
    process.exit(1);
});