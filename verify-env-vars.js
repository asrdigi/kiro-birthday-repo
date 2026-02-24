#!/usr/bin/env node

/**
 * Environment Variables Verification
 * Helps verify your environment variables before setting them in Railway
 */

const fs = require('fs');
const path = require('path');

function verifyEnvironmentVariables() {
    console.log('🔍 Environment Variables Verification');
    console.log('='.repeat(50));
    console.log('');

    // Load environment variables from .env file
    if (fs.existsSync('.env')) {
        const envContent = fs.readFileSync('.env', 'utf8');
        const envLines = envContent.split('\n');

        envLines.forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
    }

    const requiredVars = [
        {
            name: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
            description: 'Google Service Account Email',
            validation: (value) => value && value.includes('@') && value.includes('.iam.gserviceaccount.com')
        },
        {
            name: 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
            description: 'Google Service Account Private Key',
            validation: (value) => value && value.includes('BEGIN PRIVATE KEY') && value.includes('END PRIVATE KEY')
        },
        {
            name: 'GOOGLE_SHEET_ID',
            description: 'Google Sheet ID',
            validation: (value) => value && value.length > 20 && !value.includes('/')
        },
        {
            name: 'OPENAI_API_KEY',
            description: 'OpenAI API Key',
            validation: (value) => value && (value.startsWith('sk-') || value.startsWith('sk-proj-'))
        }
    ];

    const optionalVars = [
        { name: 'NODE_ENV', description: 'Node Environment', default: 'production' },
        { name: 'CRON_SCHEDULE', description: 'Cron Schedule', default: '0 4 * * *' },
        { name: 'SCHEDULER_TIMEZONE', description: 'Scheduler Timezone', default: 'Asia/Kolkata' },
        { name: 'DATABASE_PATH', description: 'Database Path', default: '/app/data/birthday_messenger.db' },
        { name: 'WHATSAPP_TEST_MODE', description: 'WhatsApp Test Mode', default: 'true' }
    ];

    console.log('📋 Required Environment Variables:');
    console.log('');

    let allValid = true;

    requiredVars.forEach(varInfo => {
        const value = process.env[varInfo.name];
        const isValid = value && varInfo.validation(value);

        console.log(`${isValid ? '✅' : '❌'} ${varInfo.name}`);
        console.log(`   Description: ${varInfo.description}`);

        if (value) {
            if (varInfo.name.includes('PRIVATE_KEY')) {
                console.log(`   Value: [PRIVATE KEY - ${value.length} characters]`);
            } else if (varInfo.name.includes('API_KEY')) {
                console.log(`   Value: ${value.substring(0, 10)}...`);
            } else {
                console.log(`   Value: ${value}`);
            }

            if (!isValid) {
                console.log(`   ⚠️  Validation failed - check format`);
                allValid = false;
            }
        } else {
            console.log(`   Value: NOT SET`);
            allValid = false;
        }
        console.log('');
    });

    console.log('⚙️  Optional Environment Variables:');
    console.log('');

    optionalVars.forEach(varInfo => {
        const value = process.env[varInfo.name] || varInfo.default;
        console.log(`✅ ${varInfo.name}`);
        console.log(`   Description: ${varInfo.description}`);
        console.log(`   Value: ${value}`);
        console.log('');
    });

    // Provide Railway configuration format
    console.log('🚀 Railway Configuration Format:');
    console.log('');
    console.log('Copy these to Railway Variables tab:');
    console.log('');

    [...requiredVars, ...optionalVars].forEach(varInfo => {
        const value = process.env[varInfo.name] || varInfo.default || 'YOUR_VALUE_HERE';
        console.log(`${varInfo.name}=${value}`);
    });

    console.log('');

    if (allValid) {
        console.log('🎉 All required environment variables are valid!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('   1. Copy the values above to Railway Variables tab');
        console.log('   2. Save the variables in Railway');
        console.log('   3. Railway will automatically redeploy');
        console.log('   4. Check deployment logs for success');
    } else {
        console.log('❌ Some required environment variables are missing or invalid.');
        console.log('');
        console.log('🔧 Fix the issues above, then:');
        console.log('   1. Update your .env file with correct values');
        console.log('   2. Run this script again to verify');
        console.log('   3. Copy verified values to Railway');
    }

    console.log('');
    console.log('📖 For detailed setup instructions, see:');
    console.log('   • RAILWAY-ENV-SETUP.md');
    console.log('   • SETUP-GUIDE.md');
    console.log('   • .env.example');
}

verifyEnvironmentVariables();