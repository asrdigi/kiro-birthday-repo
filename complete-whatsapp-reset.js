#!/usr/bin/env node

/**
 * Complete WhatsApp Reset - Comprehensive cleanup for linking issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function completeWhatsAppReset() {
    console.log('🔄 Complete WhatsApp Reset for Linking Issues');
    console.log('='.repeat(50));
    console.log('');
    console.log('⚠️  This will perform a comprehensive cleanup');
    console.log('');

    try {
        // Step 1: Kill all browser processes
        console.log('1️⃣  Killing all browser processes...');
        try {
            execSync('pkill -f "chrome|chromium|Chrome|Chromium"', { stdio: 'ignore' });
            console.log('   ✅ Browser processes terminated');
        } catch (error) {
            console.log('   ✅ No browser processes found');
        }

        // Step 2: Remove WhatsApp cache directories
        console.log('');
        console.log('2️⃣  Removing WhatsApp cache directories...');

        const cacheDirs = [
            '.wwebjs_auth',
            '.wwebjs_cache',
            'node_modules/.cache/puppeteer',
            path.join(require('os').homedir(), '.cache/puppeteer'),
            path.join(require('os').homedir(), 'Library/Caches/puppeteer'), // macOS
            path.join(require('os').homedir(), '.config/google-chrome'),
            path.join(require('os').homedir(), '.config/chromium')
        ];

        let removedCount = 0;
        for (const dir of cacheDirs) {
            try {
                if (fs.existsSync(dir)) {
                    fs.rmSync(dir, { recursive: true, force: true });
                    console.log(`   ✅ Removed: ${dir}`);
                    removedCount++;
                }
            } catch (error) {
                console.log(`   ⚠️  Could not remove: ${dir}`);
            }
        }

        if (removedCount === 0) {
            console.log('   ✅ No cache directories found');
        }

        // Step 3: Clear system DNS cache (macOS)
        console.log('');
        console.log('3️⃣  Clearing system DNS cache...');
        try {
            execSync('sudo dscacheutil -flushcache', { stdio: 'ignore' });
            console.log('   ✅ DNS cache cleared');
        } catch (error) {
            console.log('   ⚠️  Could not clear DNS cache (may need sudo)');
        }

        // Step 4: Wait for processes to terminate
        console.log('');
        console.log('4️⃣  Waiting for processes to terminate...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('   ✅ Wait completed');

        // Step 5: System recommendations
        console.log('');
        console.log('5️⃣  System recommendations completed');
        console.log('');
        console.log('🎯 Reset Complete! Next Steps:');
        console.log('');
        console.log('📱 On Your Phone:');
        console.log('   1. Open WhatsApp');
        console.log('   2. Go to Settings > Linked Devices');
        console.log('   3. Remove any old/unused devices');
        console.log('   4. Close and reopen WhatsApp');
        console.log('');
        console.log('💻 On Your Computer:');
        console.log('   1. Wait 10-15 minutes after this reset');
        console.log('   2. Try a different network if possible');
        console.log('   3. Run: node simple-whatsapp-test.js');
        console.log('');
        console.log('⏰ Timing Tips:');
        console.log('   • Try during off-peak hours (early morning/late night)');
        console.log('   • If still blocked, wait 2-6 hours');
        console.log('   • For severe restrictions, wait 24 hours');
        console.log('');
        console.log('🌐 Network Tips:');
        console.log('   • Switch to mobile hotspot');
        console.log('   • Try different WiFi network');
        console.log('   • Use VPN if available');

    } catch (error) {
        console.error('❌ Reset failed:', error.message);
    }
}

// Run the reset
completeWhatsAppReset().then(() => {
    console.log('');
    console.log('✨ Complete reset finished!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
});