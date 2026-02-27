/**
 * Show the complete message that was generated for today's birthday
 */

require('dotenv').config();
const { MessageGenerator } = require('./dist/services/MessageGenerator');

async function showTodaysMessage() {
    console.log('📨 Generating Today\'s Birthday Message\n');
    console.log('Environment:');
    console.log(`  SENDER_NAME: ${process.env.SENDER_NAME}`);
    console.log(`  MESSAGE_STYLE: ${process.env.MESSAGE_STYLE}`);
    console.log(`  USE_EMOJIS: ${process.env.USE_EMOJIS}\n`);

    const generator = new MessageGenerator();

    try {
        await generator.initialize();

        // Today's birthday person
        const friend = {
            id: 1,
            name: 'Srinivas Reddy',
            motherTongue: 'te',
            phone: '+917396661509'
        };

        console.log(`Generating message for: ${friend.name} (Telugu)\n`);
        console.log('='.repeat(70));

        const message = await generator.generateMessage(friend);

        console.log('\n📱 COMPLETE MESSAGE:\n');
        console.log(message);
        console.log('\n' + '='.repeat(70));

        // Check for emojis
        const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
        const hasEmojis = emojiRegex.test(message);
        const hasSenderName = message.includes('శ్రీనివాస్') || message.includes('Srinivas');

        console.log('\n✅ Verification:');
        console.log(`   Emojis present: ${hasEmojis ? '✅ Yes' : '❌ No'}`);
        console.log(`   Sender name present: ${hasSenderName ? '✅ Yes' : '❌ No'}`);
        console.log(`   Language: Telugu (te)`);
        console.log(`   Message length: ${message.length} characters\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

showTodaysMessage();
