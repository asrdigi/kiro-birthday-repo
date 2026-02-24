#!/usr/bin/env node

/**
 * Quick Railway Deployment Script
 * Prepares and validates the project for Railway deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function deployToRailway() {
    console.log('🚀 Railway Deployment Preparation');
    console.log('='.repeat(50));
    console.log('');

    try {
        // Step 1: Validate required files
        console.log('1️⃣  Validating deployment files...');

        const requiredFiles = [
            'railway.json',
            'Procfile',
            '.env.production',
            'src/railway-app.ts',
            'package.json'
        ];

        let allFilesExist = true;
        for (const file of requiredFiles) {
            if (fs.existsSync(file)) {
                console.log(`   ✅ ${file}`);
            } else {
                console.log(`   ❌ ${file} - MISSING`);
                allFilesExist = false;
            }
        }

        if (!allFilesExist) {
            throw new Error('Missing required deployment files');
        }

        // Step 2: Build the project
        console.log('');
        console.log('2️⃣  Building TypeScript project...');
        try {
            execSync('npm run build', { stdio: 'inherit' });
            console.log('   ✅ Build successful');
        } catch (error) {
            throw new Error('Build failed - fix TypeScript errors first');
        }

        // Step 3: Validate environment template
        console.log('');
        console.log('3️⃣  Validating environment template...');

        const envTemplate = fs.readFileSync('.env.production', 'utf8');
        const requiredEnvVars = [
            'GOOGLE_SERVICE_ACCOUNT_EMAIL',
            'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
            'GOOGLE_SHEET_ID',
            'OPENAI_API_KEY'
        ];

        let envValid = true;
        for (const envVar of requiredEnvVars) {
            if (envTemplate.includes(envVar)) {
                console.log(`   ✅ ${envVar}`);
            } else {
                console.log(`   ❌ ${envVar} - MISSING`);
                envValid = false;
            }
        }

        if (!envValid) {
            throw new Error('Environment template is missing required variables');
        }

        // Step 4: Check Git status
        console.log('');
        console.log('4️⃣  Checking Git status...');

        try {
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            if (gitStatus.trim()) {
                console.log('   ⚠️  Uncommitted changes detected:');
                console.log(gitStatus);
                console.log('   💡 Consider committing changes before deployment');
            } else {
                console.log('   ✅ Git working directory clean');
            }
        } catch (error) {
            console.log('   ⚠️  Not a Git repository or Git not available');
        }

        // Step 5: Display deployment instructions
        console.log('');
        console.log('5️⃣  Deployment Instructions:');
        console.log('');
        console.log('🌐 Deploy to Railway:');
        console.log('   1. Go to https://railway.app');
        console.log('   2. Click "Start a New Project"');
        console.log('   3. Select "Deploy from GitHub repo"');
        console.log('   4. Choose your repository');
        console.log('   5. Click "Deploy Now"');
        console.log('');
        console.log('⚙️  Configure Environment Variables in Railway:');
        console.log('   • Copy variables from .env.production');
        console.log('   • Replace placeholder values with real credentials');
        console.log('   • Set NODE_ENV=production');
        console.log('');
        console.log('📊 Monitor Deployment:');
        console.log('   • Health Check: https://your-app.railway.app/health');
        console.log('   • Status: https://your-app.railway.app/status');
        console.log('   • Logs: Railway Dashboard → Deployments → View Logs');
        console.log('');
        console.log('📋 Required Environment Variables:');
        requiredEnvVars.forEach(envVar => {
            console.log(`   • ${envVar}`);
        });
        console.log('');
        console.log('🔧 Optional Variables:');
        console.log('   • CRON_SCHEDULE (default: 0 4 * * *)');
        console.log('   • SCHEDULER_TIMEZONE (default: Asia/Kolkata)');
        console.log('   • WHATSAPP_TEST_MODE (default: false)');
        console.log('   • LOG_LEVEL (default: info)');

        // Step 6: Create deployment checklist
        console.log('');
        console.log('✅ Pre-Deployment Checklist:');
        console.log('   □ Google Service Account created and configured');
        console.log('   □ Google Sheets API enabled');
        console.log('   □ Google Sheet shared with service account');
        console.log('   □ OpenAI API key obtained');
        console.log('   □ Friend data added to Google Sheet');
        console.log('   □ All environment variables ready');
        console.log('   □ Code committed to GitHub repository');
        console.log('');
        console.log('🎯 Post-Deployment Checklist:');
        console.log('   □ Health check endpoint responding');
        console.log('   □ Environment variables configured in Railway');
        console.log('   □ Logs showing successful initialization');
        console.log('   □ Scheduler running (check status endpoint)');
        console.log('   □ Test mode working (if enabled)');
        console.log('');

        console.log('🎉 Project is ready for Railway deployment!');
        console.log('');
        console.log('📖 For detailed instructions, see: RAILWAY-DEPLOYMENT.md');

    } catch (error) {
        console.error('');
        console.error('❌ Deployment preparation failed:', error.message);
        console.error('');
        console.error('🔧 Fix the issues above and try again');
        process.exit(1);
    }
}

// Run deployment preparation
deployToRailway().then(() => {
    console.log('');
    console.log('✨ Deployment preparation completed!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
});