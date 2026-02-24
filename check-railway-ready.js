#!/usr/bin/env node

/**
 * Railway Deployment Readiness Check
 * Verifies the fix is applied and ready for deployment
 */

const fs = require('fs');
const { execSync } = require('child_process');

function checkRailwayReady() {
    console.log('🔍 Railway Deployment Readiness Check');
    console.log('='.repeat(50));
    console.log('');

    let allChecks = true;

    // Check 1: Verify the fix is in Scheduler.ts
    console.log('1️⃣  Checking if fix is applied to Scheduler.ts...');
    try {
        const schedulerContent = fs.readFileSync('src/services/Scheduler.ts', 'utf8');

        if (schedulerContent.includes('WHATSAPP_TEST_MODE') &&
            schedulerContent.includes('WhatsApp validation skipped')) {
            console.log('   ✅ Fix is applied - test mode check added');
        } else {
            console.log('   ❌ Fix NOT applied - test mode check missing');
            allChecks = false;
        }
    } catch (error) {
        console.log('   ❌ Could not read Scheduler.ts');
        allChecks = false;
    }
    console.log('');

    // Check 2: Verify build is successful
    console.log('2️⃣  Checking if TypeScript build is successful...');
    try {
        if (fs.existsSync('dist/services/Scheduler.js')) {
            console.log('   ✅ Build output exists');
        } else {
            console.log('   ⚠️  Build output not found - run: npm run build');
            allChecks = false;
        }
    } catch (error) {
        console.log('   ❌ Could not check build output');
        allChecks = false;
    }
    console.log('');

    // Check 3: Check Git status
    console.log('3️⃣  Checking Git status...');
    try {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });

        if (gitStatus.trim()) {
            console.log('   ⚠️  Uncommitted changes detected:');
            const changes = gitStatus.trim().split('\n');
            changes.slice(0, 5).forEach(change => {
                console.log(`      ${change}`);
            });
            if (changes.length > 5) {
                console.log(`      ... and ${changes.length - 5} more`);
            }
            console.log('');
            console.log('   💡 You need to commit and push these changes');
            allChecks = false;
        } else {
            console.log('   ✅ No uncommitted changes - ready to push');
        }
    } catch (error) {
        console.log('   ⚠️  Could not check Git status');
    }
    console.log('');

    // Check 4: Verify Railway configuration files
    console.log('4️⃣  Checking Railway configuration files...');
    const railwayFiles = ['railway.json', 'Procfile', '.env.production'];
    let railwayConfigOk = true;

    railwayFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`   ✅ ${file}`);
        } else {
            console.log(`   ❌ ${file} - MISSING`);
            railwayConfigOk = false;
        }
    });

    if (!railwayConfigOk) {
        allChecks = false;
    }
    console.log('');

    // Summary and next steps
    console.log('📋 Summary:');
    console.log('');

    if (allChecks) {
        console.log('🎉 All checks passed! Ready for Railway deployment.');
        console.log('');
        console.log('📤 Next steps:');
        console.log('   1. Commit changes:');
        console.log('      git add .');
        console.log('      git commit -m "Fix: Skip WhatsApp validation in test mode"');
        console.log('');
        console.log('   2. Push to GitHub:');
        console.log('      git push origin main');
        console.log('');
        console.log('   3. Railway will auto-deploy');
        console.log('');
        console.log('   4. Verify in Railway Dashboard:');
        console.log('      • Check deployment logs');
        console.log('      • Visit /health endpoint');
        console.log('      • Visit /status endpoint');
        console.log('');
        console.log('⚠️  IMPORTANT: Make sure these are set in Railway Variables:');
        console.log('   WHATSAPP_TEST_MODE=true');
        console.log('   COMPLETE_TEST_MODE=true');
    } else {
        console.log('❌ Some checks failed. Please fix the issues above.');
        console.log('');
        console.log('🔧 Common fixes:');
        console.log('   • Run: npm run build');
        console.log('   • Commit changes: git add . && git commit -m "Fix deployment"');
        console.log('   • Verify all Railway config files exist');
    }

    console.log('');
    console.log('📖 For detailed instructions, see: FIX-RAILWAY-CRASH.md');
}

checkRailwayReady();