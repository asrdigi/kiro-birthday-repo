/**
 * Test script for TwilioWhatsAppClient
 * Tests the client in TEST MODE (no actual API calls)
 */

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set test mode
process.env.WHATSAPP_TEST_MODE = 'true';

async function testTwilioClient() {
    console.log('🧪 Testing TwilioWhatsAppClient in TEST MODE\n');

    try {
        // Import the compiled TwilioWhatsAppClient
        const { TwilioWhatsAppClient } = require('./dist/services/TwilioWhatsAppClient');

        console.log('✅ Successfully imported TwilioWhatsAppClient');

        // Create client instance
        const client = new TwilioWhatsAppClient();
        console.log('✅ Created TwilioWhatsAppClient instance');

        // Test 1: Initialize
        console.log('\n📋 Test 1: Initialize client in test mode');
        await client.initialize();
        console.log('✅ Client initialized successfully');

        // Test 2: Check if ready
        console.log('\n📋 Test 2: Check if client is ready');
        const isReady = await client.isReady();
        console.log(`✅ Client ready status: ${isReady}`);

        if (!isReady) {
            throw new Error('Client should be ready in test mode');
        }

        // Test 3: Send message with valid phone number
        console.log('\n📋 Test 3: Send message with valid phone number');
        const result1 = await client.sendMessage('+919876543210', 'Test message 1');
        console.log('✅ Message sent successfully');
        console.log('   Result:', JSON.stringify(result1, null, 2));

        if (!result1.success) {
            throw new Error('Message should succeed in test mode');
        }

        // Test 4: Send message with invalid phone number
        console.log('\n📋 Test 4: Send message with invalid phone number');
        const result2 = await client.sendMessage('invalid-number', 'Test message 2');
        console.log('✅ Invalid number handled correctly');
        console.log('   Result:', JSON.stringify(result2, null, 2));

        if (result2.success) {
            throw new Error('Invalid phone number should fail validation');
        }

        // Test 5: Send message with another valid number
        console.log('\n📋 Test 5: Send message with US number');
        const result3 = await client.sendMessage('+12025551234', 'Test message 3');
        console.log('✅ Message sent successfully');
        console.log('   Result:', JSON.stringify(result3, null, 2));

        // Test 6: Disconnect
        console.log('\n📋 Test 6: Disconnect client');
        await client.disconnect();
        console.log('✅ Client disconnected successfully');

        console.log('\n🎉 All tests passed!');
        console.log('\n📊 Summary:');
        console.log('   • Client initialization: ✅');
        console.log('   • Ready check: ✅');
        console.log('   • Valid phone number: ✅');
        console.log('   • Invalid phone number validation: ✅');
        console.log('   • Multiple messages: ✅');
        console.log('   • Disconnect: ✅');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

// Run tests
testTwilioClient().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
