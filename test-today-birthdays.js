#!/usr/bin/env node

/**
 * Test Today's Birthdays
 * Tests the current birthday detection and message sending for today's date
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader
} = require('./dist/services');
const { MessageGeneratorFactory } = require('./dist/services/MessageGeneratorFactory');
const { TwilioWhatsAppClient: WhatsAppClient } = require('./dist/services/TwilioWhatsAppClient');

async function testTodayBirthdays() {
    console.log('🧪 Testing Today\'s Birthdays (Feb 23, 2026)');
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

        // Use today's date
        const today = new Date();
        console.log(`📅 Testing for date: ${today.toLocaleDateString()}`);
        console.log('');

        // Check for birthdays today
        const birthdayFriends = friends.filter(friend => {
            return today.getMonth() === friend.birthdate.getMonth() &&
                today.getDate() === friend.birthdate.getDate();
        });

        console.log(`🎉 Found ${birthdayFriends.length} friends with birthdays today:`);
        birthdayFriends.forEach(friend => {
            console.log(`   • ${friend.name} (${friend.motherTongue}) - ${friend.whatsappNumber}`);
        });

        if (birthdayFriends.length === 0) {
            console.log('📅 No birthdays today.');
            return;
        }

        // Initialize MessageGenerator and WhatsApp client
        console.log('');
        console.log('🤖 Initializing MessageGenerator...');
        const messageGenerator = MessageGeneratorFactory.create();
        await messageGenerator.initialize();

        console.log('📱 Initializing WhatsApp client...');
        const whatsappClient = new WhatsAppClient();
        await whatsappClient.initialize();

        // Send birthday messages
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
                    console.log(`   ✅ Message sent successfully: ${result.messageId}`);
                } else {
                    console.log(`   ❌ Failed to send message: ${result.error}`);
                }
            } catch (error) {
                console.log(`   ❌ Error processing ${friend.name}: ${error.message}`);
            }
        }

        console.log('\n🎯 Today\'s birthday test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testTodayBirthdays().then(() => {
    console.log('✨ Test finished');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
});