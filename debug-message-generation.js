#!/usr/bin/env node

/**
 * Debug Message Generation - Test ChatGPT message generation directly
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator
} = require('./dist/services');

async function debugMessageGeneration() {
    console.log('🔍 Debug Message Generation');
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

        // Find Srinivas Reddy
        const srinivas = friends.find(f => f.name.includes('Srinivas'));
        if (!srinivas) {
            console.log('❌ Srinivas not found');
            return;
        }

        console.log(`🎂 Testing message generation for: ${srinivas.name}`);
        console.log(`🌍 Language: ${srinivas.motherTongue}`);

        // Initialize MessageGenerator
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();

        // Generate multiple messages to see if they're consistently short
        console.log('\n🔄 Generating 3 different messages...\n');

        for (let i = 1; i <= 3; i++) {
            console.log(`--- Message ${i} ---`);
            try {
                const message = await messageGenerator.generateMessage(srinivas);

                console.log('📄 Generated Message:');
                console.log(`"${message}"`);
                console.log('');
                console.log('📊 Stats:');
                console.log(`   • Length: ${message.length} characters`);
                console.log(`   • Words: ${message.split(' ').length}`);
                console.log(`   • Bytes: ${Buffer.byteLength(message, 'utf8')}`);
                console.log(`   • Ends with: "${message.slice(-10)}"`);
                console.log('');

                // Check if message seems complete
                const endsWithPunctuation = /[.!?।]$/.test(message.trim());
                console.log(`✅ Ends with punctuation: ${endsWithPunctuation}`);

                if (!endsWithPunctuation) {
                    console.log('⚠️  Message may be incomplete - doesn\'t end with punctuation');
                }

            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }

            console.log('\n' + '='.repeat(40) + '\n');

            // Wait 2 seconds between requests
            if (i < 3) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

    } catch (error) {
        console.error('❌ Failed to debug message generation:', error.message);
    }
}

// Run the debug
debugMessageGeneration().then(() => {
    console.log('🎯 Debug complete!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
});