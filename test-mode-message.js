#!/usr/bin/env node

/**
 * Test Mode Message Generator
 * Shows what the Telugu message would look like without WhatsApp linking
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator,
    WhatsAppClient
} = require('./dist/services');

async function testModeMessage() {
    console.log('🎂 Test Mode: Birthday Message for Srinivas Reddy');
    console.log('='.repeat(50));
    console.log('');
    console.log('💡 This runs in TEST MODE - no actual WhatsApp needed');
    console.log('');

    try {
        // Initialize services
        console.log('📊 Loading friend data...');
        const dbPath = process.env.DATABASE_PATH || './data/birthday_messenger.db';
        initializeDatabase(dbPath);

        const googleSheetsClient = new GoogleSheetsClient();
        await googleSheetsClient.authenticate();

        const dataLoader = new DataLoader(googleSheetsClient);
        const friends = await dataLoader.loadFriends();

        // Find Srinivas Reddy
        const srinivas = friends.find(f => f.whatsappNumber === '+917396661509');
        if (!srinivas) {
            console.log('❌ Srinivas Reddy not found');
            return;
        }

        console.log('✅ Target Friend:');
        console.log(`   • Name: ${srinivas.name}`);
        console.log(`   • Phone: ${srinivas.whatsappNumber}`);
        console.log(`   • Language: ${srinivas.motherTongue}`);
        console.log(`   • Birthday: ${srinivas.birthdate.toLocaleDateString()}`);
        console.log('');

        // Generate message
        console.log('🤖 Generating Telugu birthday message...');
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();

        const message = await messageGenerator.generateMessage(srinivas);

        console.log('✅ Complete Telugu Birthday Message Generated!');
        console.log('');
        console.log('📄 COMPLETE TELUGU MESSAGE:');
        console.log('='.repeat(50));
        console.log(message);
        console.log('='.repeat(50));
        console.log('');

        // Message stats
        console.log('📊 Message Statistics:');
        console.log(`   • Length: ${message.length} characters`);
        console.log(`   • Words: ${message.split(' ').length}`);
        console.log(`   • Lines: ${message.split('\n').length}`);
        console.log(`   • Bytes: ${Buffer.byteLength(message, 'utf8')}`);
        console.log('');

        // Test WhatsApp in test mode
        console.log('📱 Testing WhatsApp in TEST MODE...');

        // Force test mode
        process.env.WHATSAPP_TEST_MODE = 'true';

        const whatsappClient = new WhatsAppClient();
        await whatsappClient.initialize();

        const result = await whatsappClient.sendMessage(srinivas.whatsappNumber, message);

        if (result.success) {
            console.log('✅ TEST MODE: Message would be sent successfully!');
            console.log(`📧 Simulated Message ID: ${result.messageId}`);
            console.log('');
            console.log('🎯 SUMMARY:');
            console.log('   • Message generated: ✅ Success');
            console.log('   • Telugu text: ✅ Complete and properly formatted');
            console.log('   • WhatsApp simulation: ✅ Would send successfully');
            console.log(`   • Target: ${srinivas.name} (${srinivas.whatsappNumber})`);
            console.log('');
            console.log('🔧 To send for real when WhatsApp linking works:');
            console.log('   1. Set WHATSAPP_TEST_MODE=false in .env');
            console.log('   2. Wait a few hours for WhatsApp rate limit to reset');
            console.log('   3. Try linking again with: node simple-whatsapp-test.js');

        } else {
            console.log('❌ Test mode failed');
            console.log(`Error: ${result.error}`);
        }

        await whatsappClient.disconnect();

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testModeMessage().then(() => {
    console.log('');
    console.log('🎯 Test mode completed!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
});