#!/usr/bin/env node

/**
 * Debug Birthday Data
 * Shows exactly what data is being read from Google Sheets and how birthdays are being compared
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader
} = require('./dist/services');

async function debugBirthdays() {
    console.log('🔍 Debug Birthday Data');
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

        console.log(`✅ Loaded ${friends.length} friends`);
        console.log('');

        // Show today's date
        const today = new Date();
        console.log('📅 Today\'s Date Information:');
        console.log(`   • Full Date: ${today.toISOString()}`);
        console.log(`   • Local Date: ${today.toLocaleDateString()}`);
        console.log(`   • Month: ${today.getMonth() + 1} (${today.toLocaleDateString('en', { month: 'long' })})`);
        console.log(`   • Day: ${today.getDate()}`);
        console.log(`   • Year: ${today.getFullYear()}`);
        console.log('');

        // Debug each friend's birthday
        console.log('🎂 Friend Birthday Analysis:');
        console.log('-'.repeat(50));

        friends.forEach((friend, index) => {
            console.log(`${index + 1}. ${friend.name}:`);
            console.log(`   • Raw Birthdate: ${friend.birthdate}`);
            console.log(`   • Birthdate ISO: ${friend.birthdate.toISOString()}`);
            console.log(`   • Birth Month: ${friend.birthdate.getMonth() + 1} (${friend.birthdate.toLocaleDateString('en', { month: 'long' })})`);
            console.log(`   • Birth Day: ${friend.birthdate.getDate()}`);
            console.log(`   • Birth Year: ${friend.birthdate.getFullYear()}`);

            // Check if birthday matches today
            const isBirthdayToday = today.getMonth() === friend.birthdate.getMonth() &&
                today.getDate() === friend.birthdate.getDate();

            console.log(`   • Is Birthday Today? ${isBirthdayToday ? '🎉 YES' : '❌ NO'}`);
            console.log(`   • Phone: ${friend.whatsappNumber}`);
            console.log(`   • Country: ${friend.country}`);
            console.log('');
        });

        // Summary
        const birthdayFriends = friends.filter(friend => {
            const today = new Date();
            return today.getMonth() === friend.birthdate.getMonth() &&
                today.getDate() === friend.birthdate.getDate();
        });

        console.log('🎯 Summary:');
        console.log(`   • Total Friends: ${friends.length}`);
        console.log(`   • Birthdays Today: ${birthdayFriends.length}`);

        if (birthdayFriends.length > 0) {
            console.log('   • Birthday Friends:');
            birthdayFriends.forEach(friend => {
                console.log(`     - ${friend.name} (${friend.whatsappNumber})`);
            });
        }

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

// Run the debug
debugBirthdays().then(() => {
    console.log('✨ Debug completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Debug crashed:', error);
    process.exit(1);
});