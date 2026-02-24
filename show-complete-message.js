#!/usr/bin/env node

/**
 * Show Complete Message Generator - Saves to file to avoid terminal truncation
 * Generates and displays complete birthday messages without truncation
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator
} = require('./dist/services');

async function showCompleteMessage() {
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

        let outputContent = '';
        outputContent += '📄 Complete Birthday Messages\n';
        outputContent += '='.repeat(50) + '\n\n';

        for (const friend of birthdayFriends) {
            console.log('');
            console.log(`🎂 Friend: ${friend.name}`);
            console.log(`📱 Phone: ${friend.whatsappNumber}`);
            console.log(`🌍 Language: ${friend.motherTongue}`);
            console.log(`📅 Birthday: ${friend.birthdate.toLocaleDateString()}`);
            console.log('');

            outputContent += `🎂 Friend: ${friend.name}\n`;
            outputContent += `📱 Phone: ${friend.whatsappNumber}\n`;
            outputContent += `🌍 Language: ${friend.motherTongue}\n`;
            outputContent += `📅 Birthday: ${friend.birthdate.toLocaleDateString()}\n\n`;

            try {
                // Generate the complete message
                const message = await messageGenerator.generateMessage(friend);

                // Display in console (may be truncated)
                console.log('📄 Message Preview:');
                console.log('-'.repeat(30));
                console.log(message);
                console.log('-'.repeat(30));

                // Save complete message to output
                outputContent += '📄 Complete Message:\n';
                outputContent += '-'.repeat(30) + '\n';
                outputContent += message + '\n';
                outputContent += '-'.repeat(30) + '\n';

                // Message stats
                const stats = {
                    length: message.length,
                    lines: message.split('\n').length,
                    words: message.split(' ').length,
                    bytes: Buffer.byteLength(message, 'utf8')
                };

                console.log(`📊 Message Stats:`);
                console.log(`   • Length: ${stats.length} characters`);
                console.log(`   • Lines: ${stats.lines}`);
                console.log(`   • Words: ${stats.words}`);
                console.log(`   • Bytes: ${stats.bytes}`);

                outputContent += `📊 Message Stats:\n`;
                outputContent += `   • Length: ${stats.length} characters\n`;
                outputContent += `   • Lines: ${stats.lines}\n`;
                outputContent += `   • Words: ${stats.words}\n`;
                outputContent += `   • Bytes: ${stats.bytes}\n\n`;

                // Show character breakdown for Telugu
                if (friend.motherTongue === 'te' || friend.motherTongue === 'Telugu') {
                    console.log(`🔤 Character Analysis:`);
                    outputContent += `🔤 Character Analysis:\n`;

                    // Show each character with its Unicode code point
                    const chars = Array.from(message);
                    chars.forEach((char, index) => {
                        const unicode = char.codePointAt(0);
                        const info = `   ${index + 1}. "${char}" (U+${unicode?.toString(16).toUpperCase().padStart(4, '0')})`;
                        if (index < 20) { // Show first 20 characters in console
                            console.log(info);
                        }
                        outputContent += info + '\n';
                    });

                    if (chars.length > 20) {
                        console.log(`   ... and ${chars.length - 20} more characters`);
                    }
                    outputContent += '\n';
                }

            } catch (error) {
                const errorMsg = `❌ Error generating message: ${error.message}`;
                console.log(errorMsg);
                outputContent += errorMsg + '\n\n';
            }
        }

        // Save complete output to file
        const outputFile = path.join(__dirname, 'complete-messages.txt');
        fs.writeFileSync(outputFile, outputContent, 'utf8');

        console.log('');
        console.log(`✅ Complete messages saved to: ${outputFile}`);
        console.log('📖 Open this file to see the complete Telugu message without truncation');
        console.log('');
        console.log('✨ Complete message display finished!');

    } catch (error) {
        console.error('❌ Failed to show messages:', error.message);
    }
}

// Run the message display
showCompleteMessage().then(() => {
    console.log('🎯 Done!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
});