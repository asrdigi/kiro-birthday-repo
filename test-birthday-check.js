#!/usr/bin/env node

/**
 * Manual Birthday Check Test
 * Runs the birthday checking logic immediately without waiting for cron schedule
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator,
    WhatsAppClient
} = require('./dist/services');

async function testBirthdayCheck() {
    console.log('🧪 Manual Birthday Check Test Starting...');
    console.log('='.repeat(50));

    try {
        // Initialize database
        console.log('📊 Initializing database...');
        const dbPath = process.env.DATABASE_PATH || './data/birthday_messenger.db';
        initializeDatabase(dbPath);

        // Initialize Google Sheets client
        console.log('📋 Initializing Google Sheets client...');
        const googleSheetsClient = new GoogleSheetsClient();
        await googleSheetsClient.authenticate();

        // Initialize DataLoader
        console.log('📥 Initializing DataLoader...');
        const dataLoader = new DataLoader(googleSheetsClient);

        // Load friends data
        console.log('👥 Loading friends from Google Sheets...');
        const friends = await dataLoader.loadFriends();
        console.log(`✅ Loaded ${friends.length} valid friends`);

        if (friends.length === 0) {
            console.log('⚠️  No valid friends found. Check your Google Sheet phone number formats.');
            console.log('   Required format: +91XXXXXXXXXX (with country code and + symbol)');
            return;
        }

        // Check for birthdays today
        console.log('🎂 Checking for birthdays today...');
        const birthdayFriends = friends.filter(friend => {
            const today = new Date();
            const birthDate = new Date(friend.birthdate);
            return today.getMonth() === birthDate.getMonth() &&
                today.getDate() === birthDate.getDate();
        });

        console.log(`🎉 Found ${birthdayFriends.length} friends with birthdays today:`);
        birthdayFriends.forEach(friend => {
            console.log(`   • ${friend.name} (${friend.motherTongue}) - ${friend.whatsappNumber}`);
        });

        if (birthdayFriends.length === 0) {
            console.log('📅 No birthdays today. Test completed.');
            return;
        }

        // Initialize MessageGenerator and WhatsApp client
        console.log('🤖 Initializing MessageGenerator...');
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();

        console.log('📱 Initializing WhatsApp client...');
        const whatsappClient = new WhatsAppClient();
        await whatsappClient.initialize();

        // Send birthday messages
        console.log('💬 Sending birthday messages...');
        for (const friend of birthdayFriends) {
            try {
                // Generate personalized message
                const message = await messageGenerator.generateMessage(friend);

                // Send WhatsApp message
                const result = await whatsappClient.sendMessage(friend.whatsappNumber, message);

                if (result.success) {
                    console.log(`✅ Message sent to ${friend.name}: ${result.messageId}`);
                } else {
                    console.log(`❌ Failed to send message to ${friend.name}: ${result.error}`);
                }
            } catch (error) {
                console.log(`❌ Error processing ${friend.name}: ${error.message}`);
            }
        }

        console.log('🎯 Manual birthday check completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testBirthdayCheck().then(() => {
    console.log('✨ Test finished');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
});