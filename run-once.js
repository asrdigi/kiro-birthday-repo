#!/usr/bin/env node

/**
 * One-Time Execution Mode
 * Runs birthday check once and exits (for system cron jobs)
 */

require('dotenv').config();

const {
    initializeDatabase,
    GoogleSheetsClient,
    DataLoader,
    MessageGenerator,
    WhatsAppClient
} = require('./dist/services');

async function runOnce() {
    console.log('⚡ Birthday WhatsApp Messenger - One-Time Execution');
    console.log('='.repeat(50));
    console.log(`🕐 Execution time: ${new Date().toLocaleString()}`);
    console.log('');

    try {
        // Initialize services
        console.log('📊 Initializing services...');

        // Database
        const dbPath = process.env.DATABASE_PATH || './data/birthday_messenger.db';
        initializeDatabase(dbPath);

        // Google Sheets
        const googleSheetsClient = new GoogleSheetsClient();
        await googleSheetsClient.authenticate();

        // Data Loader
        const dataLoader = new DataLoader(googleSheetsClient);
        const friends = await dataLoader.loadFriends();
        console.log(`✅ Loaded ${friends.length} friends from Google Sheets`);

        // Check for today's birthdays
        const today = new Date();
        const birthdayFriends = friends.filter(friend => {
            return today.getMonth() === friend.birthdate.getMonth() &&
                today.getDate() === friend.birthdate.getDate();
        });

        console.log(`🎉 Found ${birthdayFriends.length} friends with birthdays today:`);
        birthdayFriends.forEach(friend => {
            console.log(`   • ${friend.name} (${friend.motherTongue}) - ${friend.whatsappNumber}`);
        });

        if (birthdayFriends.length === 0) {
            console.log('📅 No birthdays today. Exiting.');
            return;
        }

        // Initialize AI and WhatsApp
        console.log('');
        console.log('🤖 Initializing AI message generator...');
        const messageGenerator = new MessageGenerator();
        await messageGenerator.initialize();

        console.log('📱 Initializing WhatsApp client...');
        const whatsappClient = new WhatsAppClient();
        await whatsappClient.initialize();

        // Wait for WhatsApp to be ready
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds

        while (!await whatsappClient.isReady() && attempts < maxAttempts) {
            console.log(`   • Waiting for WhatsApp... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        if (!await whatsappClient.isReady()) {
            throw new Error('WhatsApp client not ready after 30 seconds');
        }

        console.log('✅ All services ready');
        console.log('');

        // Send birthday messages
        console.log('💬 Sending birthday messages...');
        let successCount = 0;
        let failureCount = 0;

        for (const friend of birthdayFriends) {
            try {
                console.log(`\n🎂 Processing ${friend.name}...`);

                // Generate message
                const message = await messageGenerator.generateMessage(friend);
                console.log(`   📝 Generated ${friend.motherTongue} message`);

                // Send WhatsApp message
                const result = await whatsappClient.sendMessage(friend.whatsappNumber, message);

                if (result.success) {
                    console.log(`   ✅ Message sent successfully (ID: ${result.messageId})`);
                    successCount++;
                } else {
                    console.log(`   ❌ Failed to send: ${result.error}`);
                    failureCount++;
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                failureCount++;
            }
        }

        // Summary
        console.log('');
        console.log('🎯 Execution Summary:');
        console.log(`   • Total birthdays: ${birthdayFriends.length}`);
        console.log(`   • Messages sent: ${successCount}`);
        console.log(`   • Failures: ${failureCount}`);
        console.log(`   • Success rate: ${Math.round((successCount / birthdayFriends.length) * 100)}%`);

        // Cleanup
        console.log('');
        console.log('🧹 Cleaning up...');
        await whatsappClient.disconnect();
        console.log('✅ WhatsApp disconnected');

        console.log('');
        console.log('🎉 One-time execution completed successfully!');

    } catch (error) {
        console.error('❌ Execution failed:', error.message);
        process.exit(1);
    }
}

// Run once and exit
runOnce().then(() => {
    console.log('✨ Exiting...');
    process.exit(0);
}).catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
});