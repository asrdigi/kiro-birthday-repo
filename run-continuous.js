#!/usr/bin/env node

/**
 * Continuous Mode Runner
 * Runs the birthday application continuously with enhanced monitoring
 */

require('dotenv').config();

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function createLogDirectory() {
    const logDir = './logs';
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    return logDir;
}

function runContinuous() {
    console.log('🚀 Starting Birthday WhatsApp Messenger in Continuous Mode');
    console.log('='.repeat(60));
    console.log('');
    console.log('📅 Schedule: Daily at 4:00 AM IST');
    console.log('🔄 Mode: Continuous (keeps running)');
    console.log('📱 WhatsApp: Real mode (will authenticate once)');
    console.log('📊 Google Sheets: Real data');
    console.log('🤖 AI Messages: Real OpenAI generation');
    console.log('');
    console.log('💡 The application will:');
    console.log('   • Start and authenticate with all services');
    console.log('   • Schedule daily execution at 4 AM IST');
    console.log('   • Run continuously in the background');
    console.log('   • Check birthdays and send messages automatically');
    console.log('   • Log all activities to console and files');
    console.log('');
    console.log('🛑 To stop: Press Ctrl+C');
    console.log('');

    // Create log directory
    const logDir = createLogDirectory();
    const logFile = path.join(logDir, `birthday-app-${new Date().toISOString().split('T')[0]}.log`);

    // Set environment for continuous mode
    process.env.WHATSAPP_TEST_MODE = 'false';
    process.env.COMPLETE_TEST_MODE = 'false';

    // Start the main application
    const child = spawn('node', ['dist/index.js'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: process.env
    });

    // Create log file stream
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    // Handle stdout (regular output)
    child.stdout.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(output);
        logStream.write(`[STDOUT] ${new Date().toISOString()} ${output}`);
    });

    // Handle stderr (error output)
    child.stderr.on('data', (data) => {
        const output = data.toString();
        process.stderr.write(output);
        logStream.write(`[STDERR] ${new Date().toISOString()} ${output}`);
    });

    // Handle process exit
    child.on('close', (code) => {
        const message = `\n🔚 Application exited with code ${code} at ${new Date().toLocaleString()}\n`;
        console.log(message);
        logStream.write(`[EXIT] ${new Date().toISOString()} ${message}`);
        logStream.end();

        if (code !== 0) {
            console.log('❌ Application crashed. Check logs for details.');
            console.log(`📄 Log file: ${logFile}`);
        }
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping application...');
        child.kill('SIGINT');
    });

    // Handle kill command
    process.on('SIGTERM', () => {
        console.log('\n🛑 Terminating application...');
        child.kill('SIGTERM');
    });

    console.log(`📄 Logs will be saved to: ${logFile}`);
    console.log('🔄 Application starting...');
    console.log('');
}

runContinuous();