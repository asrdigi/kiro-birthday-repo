/**
 * Test script to verify messages work WITHOUT emojis
 * Temporarily sets USE_EMOJIS=false
 */

// Override environment variable for this test
process.env.USE_EMOJIS = 'false';

require('dotenv').config();
const { MessageGenerator } = require('./dist/services/MessageGenerator');

async function testNoEmojiMessage() {
    console.log('🧪 Testing Message Generation WITHOUT Emojis\n');
    console.log('Environment Variables:');
    console.log(`  SENDER_NAME: ${process.env.SENDER_NAME}`);
    console.log(`  MESSAGE_STYLE: ${process.env.MESSAGE_STYLE}`);
    console.log(`  USE_EMOJIS: ${process.env.USE_EMOJIS}\n`);

    const generator = new MessageGenerator();

    try {
        console.log('Initializing MessageGenerator...');
        await generator.initialize();
        console.log('✅ Initialized successfully\n');

        const testFriend = { id: 1, name: 'Amit', motherTongue: 'hi', phone: '+919876543210' };

        console.log(`\n${'='.repeat(60)}`);
        console.log(`Generating message for ${testFriend.name} (${testFriend.motherTongue})`);
        console.log('='.repeat(60));

        const message = await generator.generateMessage(testFriend);

        console.log('\n📨 Generated Message:');
        console.log('-'.repeat(60));
        console.log(message);
        console.log('-'.repeat(60));

        // Check if emojis are present
        const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
        const hasEmojis = emojiRegex.test(message);

        if (!hasEmojis) {
            console.log('✅ No emojis in message (as expected)');
        } else {
            console.log('⚠️  Emojis found in message (unexpected!)');
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

testNoEmojiMessage();
