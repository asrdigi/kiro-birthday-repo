#!/usr/bin/env node

/**
 * Deep Cache Cleanup for WhatsApp
 * Removes all possible cache files and processes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function deepCleanup() {
    console.log('🧹 Deep WhatsApp Cache Cleanup');
    console.log('='.repeat(50));

    try {
        // Kill all browser processes
        console.log('🔪 Killing all browser processes...');
        try {
            execSync('pkill -f chrome', { stdio: 'ignore' });
            execSync('pkill -f chromium', { stdio: 'ignore' });
            execSync('pkill -f "Google Chrome"', { stdio: 'ignore' });
            execSync('pkill -f puppeteer', { stdio: 'ignore' });
            execSync('pkill -f whatsapp-web.js', { stdio: 'ignore' });
            console.log('✅ Browser processes killed');
        } catch (error) {
            console.log('✅ No browser processes to kill');
        }

        // Remove WhatsApp session files
        const filesToRemove = [
            '.wwebjs_auth',
            '.wwebjs_cache',
            'session.json',
            'whatsapp-session.json',
            '.puppeteerrc.cjs'
        ];

        console.log('📁 Removing WhatsApp session files...');
        filesToRemove.forEach(file => {
            const filePath = path.join(__dirname, file);
            try {
                if (fs.existsSync(filePath)) {
                    if (fs.lstatSync(filePath).isDirectory()) {
                        fs.rmSync(filePath, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(filePath);
                    }
                    console.log(`✅ Removed: ${file}`);
                } else {
                    console.log(`⏭️  Not found: ${file}`);
                }
            } catch (error) {
                console.log(`⚠️  Could not remove ${file}: ${error.message}`);
            }
        });

        // Remove node_modules cache
        console.log('📦 Cleaning node_modules cache...');
        const nodeModulesCaches = [
            'node_modules/.cache',
            'node_modules/.puppeteer',
            'node_modules/puppeteer/.local-chromium'
        ];

        nodeModulesCaches.forEach(cachePath => {
            const fullPath = path.join(__dirname, cachePath);
            try {
                if (fs.existsSync(fullPath)) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                    console.log(`✅ Removed: ${cachePath}`);
                } else {
                    console.log(`⏭️  Not found: ${cachePath}`);
                }
            } catch (error) {
                console.log(`⚠️  Could not remove ${cachePath}: ${error.message}`);
            }
        });

        // Remove system temp files (macOS)
        console.log('🗑️  Cleaning system temp files...');
        try {
            const tempDirs = [
                '/tmp/puppeteer_dev_chrome_profile-*',
                '/tmp/.org.chromium.*',
                '/tmp/scoped_dir*'
            ];

            tempDirs.forEach(pattern => {
                try {
                    execSync(`rm -rf ${pattern}`, { stdio: 'ignore' });
                } catch (error) {
                    // Ignore errors for temp cleanup
                }
            });
            console.log('✅ System temp files cleaned');
        } catch (error) {
            console.log('⚠️  Could not clean all temp files');
        }

        // Clear npm cache
        console.log('📦 Clearing npm cache...');
        try {
            execSync('npm cache clean --force', { stdio: 'ignore' });
            console.log('✅ npm cache cleared');
        } catch (error) {
            console.log('⚠️  Could not clear npm cache');
        }

        console.log('');
        console.log('⏳ Waiting for processes to terminate...');
        // Wait for processes to fully terminate
        setTimeout(() => {
            console.log('');
            console.log('🎯 Deep cleanup completed!');
            console.log('');
            console.log('📱 Next steps:');
            console.log('   1. Wait 30 seconds');
            console.log('   2. Run: node send-to-srinivas.js');
            console.log('   3. Scan the QR code when it appears');
            console.log('   4. Wait for "WhatsApp is ready!" message');
            console.log('   5. Message will be sent automatically');
            console.log('');
            console.log('🔧 If still having issues:');
            console.log('   • Restart your computer');
            console.log('   • Check your internet connection');
            console.log('   • Make sure WhatsApp is active on your phone');
            console.log('   • Try using a different network');
        }, 2000);

    } catch (error) {
        console.error('❌ Deep cleanup failed:', error.message);
    }
}

// Run the deep cleanup
deepCleanup();