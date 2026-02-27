#!/usr/bin/env node

/**
 * Test script to generate and display a birthday message with sender name
 */

require('dotenv').config();

async function testMessageWithName() {
    console.log('🧪 Testing Birthday Message with Sender Name');
    console.log('='.repeat(60));
    console.log('');

    try {
        // Import services
        const { MessageGenerator } = require('./dist/services/MessageGenerator');
        const { OpenAIClient } = require('./dist/services/OpenAIClient');

        // Initialize MessageGenerator
        console.log('🤖 Initializing MessageGenerator...');
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();
        console.log('✅ MessageGenerator initialized');
        console.log('');

        // Test friend data
        const testFriend = {
            id: 'test-1',
            name: 'Srinivas Reddy',
            birthdate: '1990-02-27',
            motherTongue: 'te', // Telugu
            whatsappNumber: '+917396661509',
            country: 'India'
        };

        console.log(`📝 Generating message for: ${testFriend.name}`);
        console.log(`   Language: Telugu (te)`);
        console.log(`   Sender Name: ${process.env.SENDER_NAME || 'Your Friend'}`);
        console.log('');

        // Generate message
        const message = await messageGenerator.generateMessage(testFriend);

        console.log('✅ Message generated successfully!');
        console.log('');
        console.log('📄 Full Message:');
        console.log('─'.repeat(60));
        console.log(message);
        console.log('─'.repeat(60));
        console.log('');

        // Test with English
        console.log('📝 Generating English message for comparison...');
        const englishFriend = {
            ...testFriend,
            motherTongue: 'en'
        };

        const englishMessage = await messageGenerator.generateMessage(englishFriend);
        console.log('');
        console.log('📄 English Message:');
        console.log('─'.repeat(60));
        console.log(englishMessage);
        console.log('─'.repeat(60));
        console.log('');

        console.log('✨ Test completed!');
        console.log('');
        console.log('💡 Your name should appear at the end of both messages.');

    } catch (error) {
        console.error('');
        console.error('❌ Test failed:', error.message);
        console.error('');
        process.exit(1);
    }
}

// Run test
testMessageWithName().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
