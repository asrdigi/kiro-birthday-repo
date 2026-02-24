#!/usr/bin/env node

/**
 * Repository Cleanup for Deployment
 * Removes temporary and personal files, keeps useful utilities
 */

const fs = require('fs');
const path = require('path');

function cleanupForDeployment() {
    console.log('🧹 Cleaning up repository for deployment');
    console.log('='.repeat(50));
    console.log('');

    // Files to remove (temporary/personal)
    const filesToRemove = [
        'send-to-srinivas.js',
        'send-message-with-qr.js',
        'simple-whatsapp-test.js',
        'deep-cleanup.js',
        'validate-phone-numbers.js',
        'check-time.js',
        'maintain-whatsapp.js',
        'quick-fix-whatsapp.js',
        'complete-messages.txt'
    ];

    // Files to keep (essential + utilities)
    const filesToKeep = [
        // Essential
        'deploy-to-railway.js',
        'security-checklist.js',
        'run-continuous.js',
        'run-once.js',

        // Utilities
        'cleanup-whatsapp.js',
        'whatsapp-health-check.js',
        'complete-whatsapp-reset.js',
        'create-zip-for-friend.js',
        'prepare-for-friend.js',

        // Key testing scripts (keep a few useful ones)
        'test-today-birthdays.js',
        'debug-birthdays.js',
        'show-complete-message.js',
        'test-real-whatsapp.js'
    ];

    console.log('🗑️  Removing temporary/personal files:');
    let removedCount = 0;

    filesToRemove.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                fs.unlinkSync(file);
                console.log(`   ✅ Removed: ${file}`);
                removedCount++;
            } catch (error) {
                console.log(`   ❌ Failed to remove: ${file} - ${error.message}`);
            }
        } else {
            console.log(`   ⚪ Not found: ${file}`);
        }
    });

    console.log('');
    console.log('✅ Keeping essential and utility files:');

    filesToKeep.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`   ✅ Keeping: ${file}`);
        } else {
            console.log(`   ⚪ Not found: ${file}`);
        }
    });

    console.log('');
    console.log('📁 Repository structure after cleanup:');
    console.log('');
    console.log('Essential Scripts:');
    console.log('  ├── deploy-to-railway.js     # Railway deployment prep');
    console.log('  ├── security-checklist.js   # Security validation');
    console.log('  ├── run-continuous.js       # Production runner');
    console.log('  └── run-once.js             # One-time execution');
    console.log('');
    console.log('Utility Scripts:');
    console.log('  ├── cleanup-whatsapp.js     # WhatsApp cleanup');
    console.log('  ├── whatsapp-health-check.js # Connection diagnostics');
    console.log('  ├── complete-whatsapp-reset.js # Full reset');
    console.log('  ├── create-zip-for-friend.js # Sharing utility');
    console.log('  └── prepare-for-friend.js   # Setup helper');
    console.log('');
    console.log('Debug Scripts (selected):');
    console.log('  ├── test-today-birthdays.js # Birthday testing');
    console.log('  ├── debug-birthdays.js      # Birthday debugging');
    console.log('  ├── show-complete-message.js # Message display');
    console.log('  └── test-real-whatsapp.js   # WhatsApp testing');
    console.log('');

    // Update .gitignore to prevent future temporary files
    console.log('📝 Updating .gitignore for better file management:');

    const gitignoreAdditions = `
# Temporary test files (prevent future clutter)
send-to-*.js
*-messages.txt
test-mode-*.js
debug-personal-*.js
my-*.js
quick-*.js
temp-*.js
`;

    try {
        const currentGitignore = fs.readFileSync('.gitignore', 'utf8');
        if (!currentGitignore.includes('# Temporary test files')) {
            fs.appendFileSync('.gitignore', gitignoreAdditions);
            console.log('   ✅ Updated .gitignore with temporary file patterns');
        } else {
            console.log('   ⚪ .gitignore already contains temporary file patterns');
        }
    } catch (error) {
        console.log('   ⚠️  Could not update .gitignore:', error.message);
    }

    console.log('');
    console.log(`🎉 Cleanup completed! Removed ${removedCount} temporary files.`);
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Review the remaining files');
    console.log('   2. Commit changes to Git');
    console.log('   3. Run: node deploy-to-railway.js');
    console.log('   4. Deploy to Railway');
    console.log('');
    console.log('💡 The repository is now clean and ready for professional deployment!');
}

cleanupForDeployment();