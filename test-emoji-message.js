/**
 * Test script to verify emoji support in birthday messages
 * Tests message generation with emojis enabled
 */

require('dotenv').config();
const { MessageGenerator } = require('./dist/services/MessageGenerator');

async function testEmojiMessage() {
    console.log('🧪 Testing Emoji Message Generation\n');
    console.log('Environment Variables:');
    console.log(`  SENDER_NAME: ${process.env.SENDER_NAME}`);
    console.log(`  MESSAGE_STYLE: ${process.env.MESSAGE_STYLE}`);
    console.log(`  USE_EMOJIS: ${process.env.USE_EMOJIS}\n`);

    const generator = new MessageGenerator();

    try {
        console.log('Initializing MessageGenerator...');
        await generator.initialize();
        console.log('✅ Initialized successfully\n');

        // Test with different languages
        const testFriends = [
            { id: 1, name: 'Rajesh', motherTongue: 'te', phone: '+919876543210' },
            { id: 2, name: 'Priya', motherTongue: 'hi', phone: '+919876543211' },
            { id: 3, name: 'John', motherTongue: 'en', phone: '+919876543212' }
        ];

        for (const friend of testFriends) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Generating message for ${friend.name} (${friend.motherTongue})`);
            console.log('='.repeat(60));

            const message = await generator.generateMessage(friend);

            console.log('\n📨 Generated Message:');
            console.log('-'.repeat(60));
            console.log(message);
            console.log('-'.repeat(60));

            // Check if emojis are present
            const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
            const hasEmojis = emojiRegex.test(message);

            if (hasEmojis) {
                console.log('✅ Emojis detected in message');
            } else {
                console.log('⚠️  No emojis found in message');
            }
        }

        console.log('\n\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

testEmojiMessage();
