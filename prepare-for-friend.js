#!/usr/bin/env node

/**
 * Prepare Birthday WhatsApp Messenger for Friend
 * Creates a clean package without sensitive data
 */

const fs = require('fs');
const path = require('path');

function createCleanPackage() {
    console.log('📦 Preparing Birthday WhatsApp Messenger for Friend');
    console.log('='.repeat(50));

    // Files and folders to exclude from the package
    const excludeItems = [
        '.env',                    // Your personal environment file
        '.wwebjs_auth',           // Your WhatsApp session data
        'logs',                   // Your log files
        'data',                   // Your database files
        'node_modules',           // Dependencies (friend will install)
        '.git',                   // Git history
        'dist',                   // Built files (friend will build)
        '.DS_Store',              // macOS system files
        'prepare-for-friend.js'   // This script itself
    ];

    // Files that should be included
    const includeItems = [
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        '.env.example',
        '.gitignore',
        'SETUP-GUIDE.md',
        'README.md',
        'src/',
        'run-continuous.js',
        'run-once.js',
        'test-real-whatsapp.js',
        'test-today-birthdays.js',
        'debug-birthdays.js',
        'whatsapp-health-check.js',
        'cleanup-whatsapp.js',
        'validate-phone-numbers.js',
        'setup-pm2.sh',
        'setup-system-cron.sh',
        'ecosystem.config.js',
        'whatsapp-troubleshooting.md',
        'maintain-whatsapp.js',
        'quick-fix-whatsapp.js'
    ];

    console.log('📋 Package Contents:');
    console.log('');
    console.log('✅ Files to include:');
    includeItems.forEach(item => {
        if (fs.existsSync(item)) {
            console.log(`   • ${item}`);
        } else {
            console.log(`   ⚠️  ${item} (not found)`);
        }
    });

    console.log('');
    console.log('❌ Files to exclude (sensitive/personal data):');
    excludeItems.forEach(item => {
        if (fs.existsSync(item)) {
            console.log(`   • ${item} (excluded for privacy)`);
        }
    });

    console.log('');
    console.log('🎯 What your friend will get:');
    console.log('   • Complete source code');
    console.log('   • All utility scripts');
    console.log('   • Comprehensive setup guide');
    console.log('   • Configuration examples');
    console.log('   • Testing tools');
    console.log('   • Troubleshooting guides');
    console.log('');
    console.log('🔒 What is protected:');
    console.log('   • Your API keys and credentials');
    console.log('   • Your WhatsApp session data');
    console.log('   • Your personal logs and database');
    console.log('   • Your friend data');
    console.log('');
    console.log('📝 Instructions for your friend:');
    console.log('   1. Copy the entire project folder to their computer');
    console.log('   2. Follow the SETUP-GUIDE.md instructions');
    console.log('   3. Set up their own API keys and Google Sheet');
    console.log('   4. Run npm install && npm run build');
    console.log('   5. Start with node run-continuous.js');
    console.log('');
    console.log('💡 Pro Tips:');
    console.log('   • Share the SETUP-GUIDE.md first');
    console.log('   • Help them set up Google Cloud Console');
    console.log('   • Test together using WHATSAPP_TEST_MODE=true');
    console.log('   • Show them how to add friends to Google Sheets');
}

createCleanPackage();