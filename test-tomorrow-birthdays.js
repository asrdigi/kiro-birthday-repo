#!/usr/bin/env node

/**
 * Test Tomorrow's Birthdays
 * Simulates running the birthday check for February 24th
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator,
    WhatsAppClient
} = require('./dist/services');

async function testTomorrowBirthdays() {
    console.log('🧪 Testing Tomorrow\'s Birthdays (Feb 24, 2026)');
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

        // Simulate tomorrow's date (Feb 24, 2026)
        const tomorrow = new Date(2026, 1, 24); // Month is 0-indexed, so 1 = February
        console.log(`📅 Simulating date: ${tomorrow.toLocaleDateString()}`);
        console.log('');

        // Check for birthdays on Feb 24
        const birthdayFriends = friends.filter(friend => {
            return tomorrow.getMonth() === friend.birthdate.getMonth() &&
                tomorrow.getDate() === friend.birthdate.getDate();
        });

        console.log(`🎉 Found ${birthdayFriends.length} friends with birthdays on Feb 24:`);
        birthdayFriends.forEach(friend => {
            console.log(`   • ${friend.name} (${friend.motherTongue}) - ${friend.whatsappNumber}`);
        });

        if (birthdayFriends.length === 0) {
            console.log('📅 No birthdays on Feb 24. Check your Google Sheet dates.');
            return;
        }

        // Initialize MessageGenerator and WhatsApp client
        console.log('');
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

        console.log('🎯 Tomorrow\'s birthday test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testTomorrowBirthdays().then(() => {
    console.log('✨ Test finished');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
});