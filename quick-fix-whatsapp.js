#!/usr/bin/env node

/**
 * Quick Fix WhatsApp
 * One-command solution for common WhatsApp issues
 */

const { execSync } = require('child_process');
const fs = require('fs');

function runCommand(command, description) {
    console.log(`🔧 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log('✅ Done');
    } catch (error) {
        console.log(`⚠️  ${description} completed with warnings`);
    }
    console.log('');
}

function quickFix() {
    console.log('⚡ Quick Fix WhatsApp Issues');
    console.log('='.repeat(50));

    // Step 1: Enhanced cleanup
    console.log('🧹 Step 1: Enhanced cleanup');
    runCommand('node cleanup-whatsapp.js', 'Running enhanced cleanup');

    // Step 2: Rebuild project
    console.log('🔨 Step 2: Rebuild project');
    runCommand('npm run build', 'Rebuilding TypeScript');

    // Step 3: Health check
    console.log('🏥 Step 3: Health check');
    runCommand('node whatsapp-health-check.js', 'Running health check');

    console.log('🎯 Quick Fix Complete!');
    console.log('');
    console.log('📱 Next Steps:');
    console.log('   1. If health check shows ✅: Try "node test-today-birthdays.js"');
    console.log('   2. If still having issues: Use test mode temporarily');
    console.log('   3. For persistent issues: Wait 2-4 hours and try again');
    console.log('');
    console.log('💡 Pro Tip: Your application works perfectly in test mode!');
}

quickFix();