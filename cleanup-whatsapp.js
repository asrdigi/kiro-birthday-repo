#!/usr/bin/env node

/**
 * Enhanced WhatsApp Cleanup
 * Comprehensive cleanup of all WhatsApp-related cache, sessions, and browser data
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`✅ Removed: ${dirPath}`);
            return true;
        } catch (error) {
            console.log(`⚠️  Could not remove ${dirPath}: ${error.message}`);
            return false;
        }
    }
    return false;
}

function killProcesses() {
    console.log('🔪 Killing any running Chrome/Chromium processes...');

    try {
        if (os.platform() === 'darwin') { // macOS
            execSync('pkill -f "chrome|chromium" || true', { stdio: 'ignore' });
        } else if (os.platform() === 'linux') {
            execSync('pkill -f "chrome|chromium" || true', { stdio: 'ignore' });
        } else if (os.platform() === 'win32') {
            execSync('taskkill /f /im chrome.exe /t || true', { stdio: 'ignore' });
            execSync('taskkill /f /im chromium.exe /t || true', { stdio: 'ignore' });
        }
        console.log('✅ Browser processes cleaned');
    } catch (error) {
        console.log('ℹ️  No browser processes to kill');
    }
}

function cleanupSystemCache() {
    console.log('🧹 Cleaning system-level browser cache...');

    const homeDir = os.homedir();
    const systemCachePaths = [];

    if (os.platform() === 'darwin') { // macOS
        systemCachePaths.push(
            path.join(homeDir, 'Library/Caches/Google/Chrome'),
            path.join(homeDir, 'Library/Caches/Chromium'),
            path.join(homeDir, 'Library/Application Support/Google/Chrome/Default/Local Storage'),
            path.join(homeDir, 'Library/Application Support/Google/Chrome/Default/Session Storage')
        );
    } else if (os.platform() === 'linux') {
        systemCachePaths.push(
            path.join(homeDir, '.cache/google-chrome'),
            path.join(homeDir, '.cache/chromium'),
            path.join(homeDir, '.config/google-chrome/Default/Local Storage'),
            path.join(homeDir, '.config/google-chrome/Default/Session Storage')
        );
    } else if (os.platform() === 'win32') {
        const appData = process.env.APPDATA || path.join(homeDir, 'AppData/Roaming');
        const localAppData = process.env.LOCALAPPDATA || path.join(homeDir, 'AppData/Local');
        systemCachePaths.push(
            path.join(localAppData, 'Google/Chrome/User Data/Default/Local Storage'),
            path.join(localAppData, 'Google/Chrome/User Data/Default/Session Storage'),
            path.join(localAppData, 'Chromium/User Data/Default/Local Storage')
        );
    }

    let systemCleaned = false;
    systemCachePaths.forEach(cachePath => {
        if (removeDirectory(cachePath)) {
            systemCleaned = true;
        }
    });

    if (!systemCleaned) {
        console.log('ℹ️  No system cache found to clean');
    }
}

function cleanupWhatsAppSessions() {
    console.log('🧹 Enhanced WhatsApp Cleanup');
    console.log('='.repeat(50));

    // Step 1: Kill any running browser processes
    killProcesses();

    // Step 2: Clean project-specific cache
    console.log('📁 Cleaning project cache...');
    const projectCachePaths = [
        '.wwebjs_auth',
        '.wwebjs_cache',
        'node_modules/.cache/puppeteer',
        'node_modules/.cache',
        '.cache',
        'temp',
        'tmp'
    ];

    let projectCleaned = false;
    projectCachePaths.forEach(sessionPath => {
        if (removeDirectory(sessionPath)) {
            projectCleaned = true;
        }
    });

    if (!projectCleaned) {
        console.log('ℹ️  No project cache found to clean');
    }

    // Step 3: Clean system-level browser cache (optional, commented out by default)
    // Uncomment the next line if you want to clean system browser cache too
    // cleanupSystemCache();

    // Step 4: Wait a moment for processes to fully terminate
    console.log('⏳ Waiting for processes to terminate...');
    setTimeout(() => {
        console.log('');
        console.log('🎯 Enhanced cleanup completed!');
        console.log('');
        console.log('📱 Recommendations:');
        console.log('   1. Wait 30 seconds before trying WhatsApp');
        console.log('   2. Make sure WhatsApp is active on your phone');
        console.log('   3. Try: node test-today-birthdays.js');
        console.log('');
        console.log('🔧 If issues persist, try:');
        console.log('   - Restart your computer');
        console.log('   - Use a different network');
        console.log('   - Try at a different time of day');
    }, 2000);
}

cleanupWhatsAppSessions();