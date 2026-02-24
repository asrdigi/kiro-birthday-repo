#!/usr/bin/env node

/**
 * Validate Phone Numbers
 * Checks all phone numbers in Google Sheets and suggests corrections
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader
} = require('./dist/services');

async function validatePhoneNumbers() {
    console.log('📞 Phone Number Validation');
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

        // Validate each phone number
        console.log('📱 Phone Number Analysis:');
        console.log('-'.repeat(50));

        friends.forEach((friend, index) => {
            console.log(`${index + 1}. ${friend.name}:`);
            console.log(`   • Phone: ${friend.whatsappNumber}`);
            console.log(`   • Country: ${friend.country}`);

            // Check for common issues
            const issues = [];

            // Check if number is too short or too long
            const digits = friend.whatsappNumber.replace(/[^\d]/g, '');
            if (digits.length < 10) {
                issues.push('Too short (less than 10 digits)');
            } else if (digits.length > 15) {
                issues.push('Too long (more than 15 digits)');
            }

            // Check for duplicate country codes
            if (friend.country.toLowerCase() === 'india') {
                if (digits.startsWith('9191')) {
                    issues.push('Duplicate country code (91 appears twice)');
                    const corrected = '+91' + digits.substring(4);
                    console.log(`   🔧 Suggested correction: ${corrected}`);
                }
            }

            // Check if number looks valid
            if (issues.length === 0) {
                console.log(`   ✅ Phone number looks valid`);
            } else {
                console.log(`   ⚠️  Issues found: ${issues.join(', ')}`);
            }

            console.log('');
        });

        // Summary
        console.log('🎯 Summary:');
        const validNumbers = friends.filter(friend => {
            const digits = friend.whatsappNumber.replace(/[^\d]/g, '');
            return digits.length >= 10 && digits.length <= 15 && !digits.startsWith('9191');
        });

        console.log(`   • Total Friends: ${friends.length}`);
        console.log(`   • Valid Phone Numbers: ${validNumbers.length}`);
        console.log(`   • Invalid Phone Numbers: ${friends.length - validNumbers.length}`);

    } catch (error) {
        console.error('❌ Validation failed:', error.message);
    }
}

// Run the validation
validatePhoneNumbers().then(() => {
    console.log('✨ Validation completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Validation crashed:', error);
    process.exit(1);
});