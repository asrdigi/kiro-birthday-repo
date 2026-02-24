#!/usr/bin/env node

/**
 * WhatsApp Health Check
 * Comprehensive diagnostic tool for WhatsApp connection issues
 */

require('dotenv').config();

const { WhatsAppClient } = require('./dist/services');
const fs = require('fs');
const os = require('os');

async function checkWhatsAppHealth() {
    console.log('🏥 WhatsApp Health Check');
    console.log('='.repeat(50));

    // System Information
    console.log('💻 System Information:');
    console.log(`   • Platform: ${os.platform()}`);
    console.log(`   • Architecture: ${os.arch()}`);
    console.log(`   • Node.js Version: ${process.version}`);
    console.log(`   • Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB total, ${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB free`);
    console.log('');

    // Environment Check
    console.log('🔧 Environment Check:');
    console.log(`   • WHATSAPP_TEST_MODE: ${process.env.WHATSAPP_TEST_MODE}`);
    console.log(`   • COMPLETE_TEST_MODE: ${process.env.COMPLETE_TEST_MODE}`);
    console.log('');

    // File System Check
    console.log('📁 File System Check:');
    const pathsToCheck = [
        '.wwebjs_auth',
        '.wwebjs_cache',
        'node_modules/.cache/puppeteer',
        'dist/services'
    ];

    pathsToCheck.forEach(path => {
        const exists = fs.existsSync(path);
        console.log(`   • ${path}: ${exists ? '✅ Exists' : '❌ Missing'}`);

        if (exists && path === '.wwebjs_auth') {
            try {
                const stats = fs.statSync(path);
                console.log(`     - Created: ${stats.birthtime.toLocaleString()}`);
                console.log(`     - Modified: ${stats.mtime.toLocaleString()}`);
            } catch (error) {
                console.log(`     - Error reading stats: ${error.message}`);
            }
        }
    });
    console.log('');

    // WhatsApp Client Test
    console.log('📱 WhatsApp Client Test:');

    if (process.env.WHATSAPP_TEST_MODE === 'true') {
        console.log('   • Mode: TEST MODE (simulated)');
        try {
            const whatsappClient = new WhatsAppClient();
            await whatsappClient.initialize();
            const isReady = await whatsappClient.isReady();
            console.log(`   • Status: ${isReady ? '✅ Ready' : '❌ Not Ready'}`);
            console.log('   • Test Mode: ✅ Working correctly');
        } catch (error) {
            console.log(`   • Error: ❌ ${error.message}`);
        }
    } else {
        console.log('   • Mode: REAL MODE (actual WhatsApp)');
        console.log('   • Status: Will attempt real connection...');

        try {
            const whatsappClient = new WhatsAppClient();

            // Set a timeout for the initialization
            const initPromise = whatsappClient.initialize();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Initialization timeout after 60 seconds')), 60000);
            });

            await Promise.race([initPromise, timeoutPromise]);

            const isReady = await whatsappClient.isReady();
            console.log(`   • Status: ${isReady ? '✅ Ready' : '❌ Not Ready'}`);

            if (isReady) {
                console.log('   • Connection: ✅ Successfully connected to WhatsApp');
            } else {
                console.log('   • Connection: ⚠️  Connected but not ready for messages');
            }

            // Clean disconnect
            await whatsappClient.disconnect();

        } catch (error) {
            console.log(`   • Error: ❌ ${error.message}`);

            if (error.message.includes('Can\'t link new devices')) {
                console.log('   • Issue: WhatsApp device linking restriction');
                console.log('   • Solution: Wait 2-4 hours and try again');
            } else if (error.message.includes('browser is already running')) {
                console.log('   • Issue: Browser session conflict');
                console.log('   • Solution: Run "node cleanup-whatsapp.js"');
            } else if (error.message.includes('timeout')) {
                console.log('   • Issue: Connection timeout');
                console.log('   • Solution: Check internet connection and try again');
            }
        }
    }

    console.log('');
    console.log('🎯 Health Check Summary:');
    console.log('   • If all systems show ✅, your application is healthy');
    console.log('   • If WhatsApp shows ❌, try the suggested solutions');
    console.log('   • Test mode always works for development and testing');
    console.log('');
    console.log('🔧 Quick Fixes:');
    console.log('   1. Run: node cleanup-whatsapp.js');
    console.log('   2. Wait 30 seconds');
    console.log('   3. Try again');
    console.log('   4. If still failing, use test mode temporarily');
}

// Run the health check
checkWhatsAppHealth().then(() => {
    console.log('✨ Health check completed');
    process.exit(0);
}).catch(error => {
    console.error('💥 Health check failed:', error.message);
    process.exit(1);
});