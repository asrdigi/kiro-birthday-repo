#!/usr/bin/env node

/**
 * File Organization Analysis
 * Categorizes project files and recommends what to include in repository
 */

const fs = require('fs');
const path = require('path');

function organizeFiles() {
    console.log('📁 Project File Organization Analysis');
    console.log('='.repeat(50));
    console.log('');

    // Get all JS files in root directory
    const files = fs.readdirSync('.').filter(file =>
        file.endsWith('.js') && !file.startsWith('node_modules')
    );

    const categories = {
        essential: {
            title: '🚀 Essential for Repository (KEEP)',
            description: 'Core functionality and deployment files',
            files: []
        },
        utilities: {
            title: '🔧 Utility Scripts (KEEP)',
            description: 'Useful for maintenance and troubleshooting',
            files: []
        },
        testing: {
            title: '🧪 Testing Scripts (OPTIONAL)',
            description: 'Development and debugging tools',
            files: []
        },
        temporary: {
            title: '🗑️ Temporary Files (REMOVE)',
            description: 'One-time use or obsolete files',
            files: []
        }
    };

    // Categorize files
    const fileCategories = {
        // Essential files
        'deploy-to-railway.js': 'essential',
        'security-checklist.js': 'essential',
        'run-continuous.js': 'essential',
        'run-once.js': 'essential',

        // Utility scripts
        'cleanup-whatsapp.js': 'utilities',
        'whatsapp-health-check.js': 'utilities',
        'complete-whatsapp-reset.js': 'utilities',
        'create-zip-for-friend.js': 'utilities',
        'prepare-for-friend.js': 'utilities',
        'quick-start.js': 'utilities',

        // Testing scripts
        'test-today-birthdays.js': 'testing',
        'test-tomorrow-birthdays.js': 'testing',
        'test-real-whatsapp.js': 'testing',
        'test-birthday-check.js': 'testing',
        'debug-birthdays.js': 'testing',
        'debug-message-generation.js': 'testing',
        'debug-whatsapp-delivery.js': 'testing',
        'show-full-message.js': 'testing',
        'show-complete-message.js': 'testing',
        'test-mode-message.js': 'testing',

        // Temporary/specific files
        'send-to-srinivas.js': 'temporary',
        'send-message-with-qr.js': 'temporary',
        'simple-whatsapp-test.js': 'temporary',
        'deep-cleanup.js': 'temporary',
        'validate-phone-numbers.js': 'temporary',
        'check-time.js': 'temporary',
        'maintain-whatsapp.js': 'temporary',
        'quick-fix-whatsapp.js': 'temporary'
    };

    // Categorize files
    files.forEach(file => {
        const category = fileCategories[file] || 'testing';
        categories[category].files.push(file);
    });

    // Display categorization
    Object.entries(categories).forEach(([key, category]) => {
        if (category.files.length > 0) {
            console.log(category.title);
            console.log(category.description);
            console.log('');
            category.files.forEach(file => {
                const exists = fs.existsSync(file);
                console.log(`   ${exists ? '✅' : '❌'} ${file}`);
            });
            console.log('');
        }
    });

    // Recommendations
    console.log('📋 Recommendations:');
    console.log('');

    console.log('✅ DEFINITELY INCLUDE:');
    console.log('   • Core application files (src/*)');
    console.log('   • Configuration files (package.json, tsconfig.json, etc.)');
    console.log('   • Deployment files (railway.json, Procfile, etc.)');
    console.log('   • Documentation (*.md files)');
    console.log('   • Essential scripts (deploy-to-railway.js, security-checklist.js)');
    console.log('   • Utility scripts (cleanup, health-check, etc.)');
    console.log('');

    console.log('🤔 OPTIONAL (Your Choice):');
    console.log('   • Testing scripts - Useful for debugging but not required');
    console.log('   • Debug scripts - Helpful for troubleshooting');
    console.log('   • Example scripts - Good for documentation');
    console.log('');

    console.log('❌ SHOULD REMOVE:');
    console.log('   • Personal/specific scripts (send-to-srinivas.js)');
    console.log('   • Temporary debugging files');
    console.log('   • Duplicate functionality scripts');
    console.log('   • Generated files (complete-messages.txt)');
    console.log('');

    // Create .gitignore recommendations
    console.log('📝 Recommended .gitignore additions:');
    console.log('');
    console.log('# Temporary test files');
    console.log('send-to-*.js');
    console.log('*-messages.txt');
    console.log('test-mode-*.js');
    console.log('');
    console.log('# Personal debugging scripts');
    console.log('debug-personal-*.js');
    console.log('my-*.js');
    console.log('');

    return categories;
}

organizeFiles();