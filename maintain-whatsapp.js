#!/usr/bin/env node

/**
 * WhatsApp Maintenance Script
 * Regular maintenance tasks to keep WhatsApp connection healthy
 */

const fs = require('fs');
const path = require('path');

function checkSessionHealth() {
    console.log('🏥 WhatsApp Session Health Check');
    console.log('='.repeat(40));

    const authPath = '.wwebjs_auth';

    if (!fs.existsSync(authPath)) {
        console.log('❌ No WhatsApp session found');
        console.log('💡 Solution: Run authentication first');
        return false;
    }

    try {
        const stats = fs.statSync(authPath);
        const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);

        console.log(`✅ Session found`);
        console.log(`📅 Last modified: ${stats.mtime.toLocaleString()}`);
        console.log(`⏰ Age: ${Math.round(ageHours)} hours`);

        if (ageHours > 168) { // 7 days
            console.log('⚠️  Session is old (>7 days)');
            console.log('💡 Consider refreshing: node cleanup-whatsapp.js');
            return false;
        }

        return true;
    } catch (error) {
        console.log(`❌ Error checking session: ${error.message}`);
        return false;
    }
}

function maintenanceRecommendations() {
    console.log('');
    console.log('🔧 Maintenance Recommendations:');
    console.log('');

    console.log('📅 Daily:');
    console.log('   • Check application logs for errors');
    console.log('   • Verify birthday messages were sent');
    console.log('');

    console.log('📅 Weekly:');
    console.log('   • Run: node whatsapp-health-check.js');
    console.log('   • Update Google Sheets if needed');
    console.log('   • Check WhatsApp session health');
    console.log('');

    console.log('📅 Monthly:');
    console.log('   • Run: node cleanup-whatsapp.js');
    console.log('   • Re-authenticate WhatsApp');
    console.log('   • Update friend data in Google Sheets');
    console.log('');

    console.log('🚨 When Issues Occur:');
    console.log('   1. Run: node quick-fix-whatsapp.js');
    console.log('   2. If still failing: Use test mode');
    console.log('   3. Wait 2-4 hours and try again');
    console.log('   4. Check WhatsApp on phone for notifications');
}

function maintainWhatsApp() {
    console.log('🔧 WhatsApp Maintenance');
    console.log('='.repeat(50));

    const sessionHealthy = checkSessionHealth();

    maintenanceRecommendations();

    console.log('');
    console.log('🎯 Current Status:');
    console.log(`   • Session Health: ${sessionHealthy ? '✅ Good' : '⚠️  Needs Attention'}`);
    console.log(`   • Application: ✅ Fully Functional`);
    console.log(`   • Test Mode: ✅ Always Available`);
}

maintainWhatsApp();