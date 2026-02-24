#!/usr/bin/env node

/**
 * Start Birthday Messenger in Real WhatsApp Mode
 * Quick startup script with pre-flight checks
 */

const fs = require('fs');
const { execSync } = require('child_process');

async function startRealMode() {
    console.log('🚀 Starting Birthday WhatsApp Messenger - REAL MODE');
    console.log('='.repeat(60));
    console.log('');

    // Pre-flight checks
    console.log('✈️  Pre-flight checks...');
    console.log('');

    // Check 1: Verify .env file exists
    if (!fs.existsSync('.env')) {
        console.error('❌ .env file not found!');
        console.error('   Copy .env.example to .env and configure it');
        process.exit(1);
    }
    console.log('✅ .env file found');

    // Check 2: Read and verify test mode is disabled
    const envContent = fs.readFileSync('.env', 'utf8');
    const testModeMatch = envContent.match(/WHATSAPP_TEST_MODE=(true|false)/);

    if (!testModeMatch) {
        console.error('❌ WHATSAPP_TEST_MODE not found in .env');
        process.exit(1);
    }

    const testMode = testModeMatch[1] === 'true';

    if (testMode) {
        console.log('⚠️  WHATSAPP_TEST_MODE is currently: true');
        console.log('');
        console.log('❌ Cannot start in REAL MODE while test mode is enabled!');
        console.log('');
        console.log('🔧 To fix:');
        console.log('   1. Open .env file');
        console.log('   2. Change: WHATSAPP_TEST_MODE=false');
        console.log('   3. Save and run this script again');
        console.log('');
        process.exit(1);
    }

    console.log('✅ WHATSAPP_TEST_MODE is: false (Real mode enabled)');

    // Check 3: Verify required environment variables
    const requiredVars = [
        'GOOGLE_SERVICE_ACCOUNT_EMAIL',
        'GOOGLE_SHEET_ID',
        'OPENAI_API_KEY'
    ];

    let missingVars = [];
    requiredVars.forEach(varName => {
        if (!envContent.includes(varName + '=')) {
            missingVars.push(varName);
        }
    });

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(v => console.error(`   - ${v}`));
        process.exit(1);
    }
    console.log('✅ Required environment variables configured');

    // Check 4: Verify build exists
    if (!fs.existsSync('dist')) {
        console.log('⚠️  Build not found, building now...');
        try {
            execSync('npm run build', { stdio: 'inherit' });
            console.log('✅ Build successful');
        } catch (error) {
            console.error('❌ Build failed');
            process.exit(1);
        }
    } else {
        console.log('✅ Build exists');
    }

    console.log('');
    console.log('🎯 Configuration Summary:');
    console.log('   • Mode: REAL WhatsApp (messages will be sent)');
    console.log('   • Schedule: Daily at 4:00 AM IST');
    console.log('   • Data Source: Google Sheets');
    console.log('   • Message Generator: OpenAI GPT');
    console.log('');

    console.log('📱 WhatsApp Authentication:');
    console.log('   • You will see a QR code in your terminal');
    console.log('   • Open WhatsApp on your phone');
    console.log('   • Go to Settings → Linked Devices');
    console.log('   • Tap "Link a Device"');
    console.log('   • Scan the QR code');
    console.log('');

    console.log('⚠️  IMPORTANT:');
    console.log('   • Keep this terminal window open');
    console.log('   • Keep your computer running 24/7');
    console.log('   • Ensure stable internet connection');
    console.log('   • Messages will be sent to REAL phone numbers');
    console.log('');

    console.log('🛑 To stop: Press Ctrl+C');
    console.log('');
    console.log('='.repeat(60));
    console.log('');

    // Wait a moment for user to read
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🚀 Starting application...');
    console.log('');

    // Start the application
    try {
        execSync('node run-continuous.js', { stdio: 'inherit' });
    } catch (error) {
        if (error.signal === 'SIGINT') {
            console.log('');
            console.log('👋 Application stopped by user');
            process.exit(0);
        } else {
            console.error('');
            console.error('❌ Application crashed:', error.message);
            process.exit(1);
        }
    }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('');
    console.log('👋 Shutting down gracefully...');
    process.exit(0);
});

startRealMode().catch(error => {
    console.error('');
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
});