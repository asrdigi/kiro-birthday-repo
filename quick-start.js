#!/usr/bin/env node

/**
 * Quick Start Script for New Users
 * Guides through initial setup and validation
 */

const fs = require('fs');
const { execSync } = require('child_process');

function quickStart() {
    console.log('🚀 Birthday WhatsApp Messenger - Quick Start');
    console.log('='.repeat(50));
    console.log('');

    // Step 1: Check Node.js
    console.log('1️⃣  Checking Node.js installation...');
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        console.log(`   ✅ Node.js ${nodeVersion} found`);
    } catch (error) {
        console.log('   ❌ Node.js not found. Please install Node.js from https://nodejs.org/');
        return;
    }

    // Step 2: Check if dependencies are installed
    console.log('');
    console.log('2️⃣  Checking dependencies...');
    if (!fs.existsSync('node_modules')) {
        console.log('   📦 Installing dependencies...');
        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('   ✅ Dependencies installed successfully');
        } catch (error) {
            console.log('   ❌ Failed to install dependencies');
            return;
        }
    } else {
        console.log('   ✅ Dependencies already installed');
    }

    // Step 3: Check .env file
    console.log('');
    console.log('3️⃣  Checking configuration...');
    if (!fs.existsSync('.env')) {
        console.log('   ⚠️  .env file not found');
        console.log('   📝 Creating .env from template...');
        try {
            fs.copyFileSync('.env.example', '.env');
            console.log('   ✅ .env file created');
            console.log('   🔧 Please edit .env file with your API keys and credentials');
        } catch (error) {
            console.log('   ❌ Failed to create .env file');
            return;
        }
    } else {
        console.log('   ✅ .env file found');
    }

    // Step 4: Build project
    console.log('');
    console.log('4️⃣  Building project...');
    try {
        execSync('npm run build', { stdio: 'inherit' });
        console.log('   ✅ Project built successfully');
    } catch (error) {
        console.log('   ❌ Build failed. Check for TypeScript errors.');
        return;
    }

    // Step 5: Create directories
    console.log('');
    console.log('5️⃣  Creating directories...');
    const dirs = ['data', 'logs'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`   ✅ Created ${dir}/ directory`);
        } else {
            console.log(`   ✅ ${dir}/ directory exists`);
        }
    });

    // Final instructions
    console.log('');
    console.log('🎉 Quick Start Complete!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Edit .env file with your credentials:');
    console.log('      • Google Service Account credentials');
    console.log('      • OpenAI API key');
    console.log('      • Google Sheet ID');
    console.log('');
    console.log('   2. Set up your Google Sheet with friend data');
    console.log('');
    console.log('   3. Test your setup:');
    console.log('      node whatsapp-health-check.js');
    console.log('');
    console.log('   4. Run the application:');
    console.log('      node run-continuous.js');
    console.log('');
    console.log('📖 For detailed instructions, see SETUP-GUIDE.md');
    console.log('');
    console.log('🆘 Need help? Check whatsapp-troubleshooting.md');
}

quickStart();