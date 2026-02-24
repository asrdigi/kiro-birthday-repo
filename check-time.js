#!/usr/bin/env node

/**
 * Time Checker for Birthday WhatsApp Messenger
 * Shows current IST time and next scheduled run
 */

const now = new Date();
const istTime = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

const istTime12 = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

// Calculate next 8:15 AM
const nextRun = new Date(now);
nextRun.setHours(8, 15, 0, 0);

// If 8:15 AM has passed today, schedule for tomorrow
if (now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() >= 15)) {
    nextRun.setDate(nextRun.getDate() + 1);
}

const nextRunIST = nextRun.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

// Calculate time difference
const timeDiff = nextRun - now;
const hours = Math.floor(timeDiff / (1000 * 60 * 60));
const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

console.log('🕐 Birthday WhatsApp Messenger - Time Check');
console.log('='.repeat(50));
console.log(`📅 Current IST Time: ${istTime12}`);
console.log(`⏰ 24-hour format: ${istTime}`);
console.log('');
console.log(`🎯 Next Scheduled Run: ${nextRunIST}`);
console.log(`⏳ Time Until Next Run: ${hours}h ${minutes}m ${seconds}s`);
console.log('');
console.log('📋 Schedule Configuration:');
console.log('   • Cron: 15 8 * * * (8:15 AM daily)');
console.log('   • Timezone: Asia/Kolkata (IST)');
console.log('   • WhatsApp Mode: Test (simulated messages)');