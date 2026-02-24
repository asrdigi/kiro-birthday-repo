#!/usr/bin/env node

/**
 * Create ZIP Package for Friend
 * Creates a clean ZIP file with all necessary files, excluding sensitive data
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function createZipForFriend() {
    console.log('📦 Creating ZIP Package for Friend');
    console.log('='.repeat(50));

    // Files and folders to include in the ZIP
    const includeItems = [
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        '.env.example',
        '.gitignore',
        'SETUP-GUIDE.md',
        'README.md',
        'quick-start.js',
        'src/',
        'run-continuous.js',
        'run-once.js',
        'test-real-whatsapp.js',
        'test-today-birthdays.js',
        'test-tomorrow-birthdays.js',
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

    // Create the ZIP file name with current date
    const today = new Date().toISOString().split('T')[0];
    const zipFileName = `birthday-whatsapp-messenger-${today}.zip`;

    console.log(`📁 Creating: ${zipFileName}`);
    console.log('');

    try {
        // Build the zip command with only the files we want to include
        const existingItems = includeItems.filter(item => {
            const exists = fs.existsSync(item);
            if (exists) {
                console.log(`✅ Including: ${item}`);
            } else {
                console.log(`⚠️  Skipping: ${item} (not found)`);
            }
            return exists;
        });

        if (existingItems.length === 0) {
            console.log('❌ No files found to include in ZIP');
            return;
        }

        // Create the zip command
        const zipCommand = `zip -r "${zipFileName}" ${existingItems.map(item => `"${item}"`).join(' ')}`;

        console.log('');
        console.log('🔄 Creating ZIP file...');
        execSync(zipCommand, { stdio: 'pipe' });

        // Check if ZIP was created successfully
        if (fs.existsSync(zipFileName)) {
            const stats = fs.statSync(zipFileName);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            console.log('');
            console.log('🎉 ZIP file created successfully!');
            console.log(`📄 File: ${zipFileName}`);
            console.log(`📊 Size: ${fileSizeMB} MB`);
            console.log(`📁 Location: ${path.resolve(zipFileName)}`);

            console.log('');
            console.log('📋 What\'s included:');
            console.log('   ✅ Complete source code');
            console.log('   ✅ Setup and troubleshooting guides');
            console.log('   ✅ All utility and testing scripts');
            console.log('   ✅ Configuration templates');
            console.log('   ✅ Package dependencies info');

            console.log('');
            console.log('🔒 What\'s excluded (your private data):');
            console.log('   ❌ Your .env file (API keys)');
            console.log('   ❌ Your WhatsApp session data');
            console.log('   ❌ Your logs and database');
            console.log('   ❌ node_modules (they\'ll install fresh)');

            console.log('');
            console.log('📤 Ready to share!');
            console.log(`   Send ${zipFileName} to your friend`);
            console.log('   They should start with SETUP-GUIDE.md');

        } else {
            console.log('❌ Failed to create ZIP file');
        }

    } catch (error) {
        console.error('❌ Error creating ZIP file:', error.message);
        console.log('');
        console.log('💡 Alternative: Manually copy these files to your friend:');
        includeItems.forEach(item => {
            if (fs.existsSync(item)) {
                console.log(`   • ${item}`);
            }
        });
    }
}

createZipForFriend();