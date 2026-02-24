#!/usr/bin/env node

/**
 * Show Full Message Generator
 * Generates and displays complete birthday messages without truncation
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator
} = require('./dist/services');

async function showFullMessage() {
    console.log('📄 Complete Birthday Message Generator');
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
        console.log('');

        // Find today's birthday friends
        const today = new Date();
        const birthdayFriends = friends.filter(friend => {
            return today.getMonth() === friend.birthdate.getMonth() &&
                today.getDate() === friend.birthdate.getDate();
        });

        if (birthdayFriends.length === 0) {
            console.log('📅 No birthdays today. Showing message for first friend as example...');
            if (friends.length > 0) {
                birthdayFriends.push(friends[0]);
            } else {
                console.log('❌ No friends found');
                return;
            }
        }

        // Initialize MessageGenerator
        console.log('🤖 Initializing MessageGenerator...');
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();

        // Generate and display complete messages
        console.log('');
        console.log('💬 Complete Birthday Messages:');
        console.log('='.repeat(50));

        for (const friend of birthdayFriends) {
            console.log('');
            console.log(`🎂 Friend: ${friend.name}`);
            console.log(`📱 Phone: ${friend.whatsappNumber}`);
            console.log(`🌍 Language: ${friend.motherTongue}`);
            console.log(`📅 Birthday: ${friend.birthdate.toLocaleDateString()}`);
            console.log('');
            console.log('📄 Complete Message:');
            console.log('-'.repeat(30));

            try {
                // Generate the complete message
                const message = await messageGenerator.generateMessage(friend);

                // Display the complete message with proper formatting
                console.log(message);

                console.log('-'.repeat(30));
                console.log(`📊 Message Stats:`);
                console.log(`   • Length: ${message.length} characters`);
                console.log(`   • Lines: ${message.split('\n').length}`);
                console.log(`   • Words: ${message.split(' ').length}`);

            } catch (error) {
                console.log(`❌ Error generating message: ${error.message}`);
            }
        }

        console.log('');
        console.log('✨ Complete message display finished!');

    } catch (error) {
        console.error('❌ Failed to show messages:', error.message);
    }
}

// Run the message display
showFullMessage().then(() => {
    console.log('🎯 Done!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
});