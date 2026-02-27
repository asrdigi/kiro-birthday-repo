/**
 * Test script for template-based message generation
 */

require('dotenv').config();
const { TemplateMessageGenerator } = require('./dist/services/TemplateMessageGenerator');

async function testTemplateMessages() {
    console.log('🧪 Testing Template-Based Message Generation\n');
    console.log('Environment:');
    console.log(`  SENDER_NAME: ${process.env.SENDER_NAME}`);
    console.log(`  MESSAGE_MODE: ${process.env.MESSAGE_MODE}`);
    console.log(`  USE_EMOJIS: ${process.env.USE_EMOJIS}\n`);

    const generator = new TemplateMessageGenerator();

    try {
        console.log('Loading message templates...');
        await generator.initialize();
        console.log('✅ Templates loaded successfully\n');

        const availableLanguages = generator.getAvailableLanguages();
        console.log(`📚 Available languages: ${availableLanguages.join(', ')}\n`);

        // Test with different friends
        const testFriends = [
            { id: 1, name: 'Srinivas Reddy', motherTongue: 'te', phone: '+917396661509' },
            { id: 2, name: 'Priya', motherTongue: 'hi', phone: '+919876543211' },
            { id: 3, name: 'John', motherTongue: 'en', phone: '+919876543212' },
            { id: 4, name: 'Kumar', motherTongue: 'ta', phone: '+919876543213' }
        ];

        for (const friend of testFriends) {
            console.log(`${'='.repeat(70)}`);
            console.log(`Generating message for ${friend.name} (${friend.motherTongue})`);
            console.log('='.repeat(70));

            const message = await generator.generateMessage(friend);

            console.log('\n📨 Generated Message:');
            console.log('-'.repeat(70));
            console.log(message);
            console.log('-'.repeat(70));
            console.log();
        }

        console.log('\n✅ All template tests completed successfully!');
        console.log('\n💡 To customize messages, edit: message-templates.json');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

testTemplateMessages();
