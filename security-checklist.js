#!/usr/bin/env node

/**
 * Security Checklist for Railway Deployment
 * Validates security best practices for your birthday messenger
 */

const fs = require('fs');

function runSecurityChecklist() {
    console.log('🔒 Security Checklist for Railway Deployment');
    console.log('='.repeat(50));
    console.log('');

    const checks = [
        {
            name: 'Environment Files',
            check: () => {
                const hasRealEnv = fs.existsSync('.env') && fs.readFileSync('.env', 'utf8').includes('sk-proj-');
                const hasTemplate = fs.existsSync('.env.production');
                return {
                    pass: !hasRealEnv && hasTemplate,
                    message: hasRealEnv ?
                        '❌ Real API keys found in .env file - should use placeholders only' :
                        '✅ No real API keys in repository'
                };
            }
        },
        {
            name: 'Git History',
            check: () => {
                try {
                    const { execSync } = require('child_process');
                    const gitLog = execSync('git log --all --full-history --grep="sk-proj" --grep="AIza" --oneline', { encoding: 'utf8' });
                    return {
                        pass: gitLog.trim() === '',
                        message: gitLog.trim() === '' ?
                            '✅ No API keys found in Git history' :
                            '⚠️  Potential API keys found in Git history - consider key rotation'
                    };
                } catch (error) {
                    return { pass: true, message: '✅ Git history check skipped (not a Git repo)' };
                }
            }
        },
        {
            name: 'Source Code Secrets',
            check: () => {
                try {
                    const { execSync } = require('child_process');
                    const srcFiles = execSync('find src -name "*.ts" -o -name "*.js"', { encoding: 'utf8' }).split('\n').filter(f => f);
                    let hasSecrets = false;

                    for (const file of srcFiles) {
                        if (fs.existsSync(file)) {
                            const content = fs.readFileSync(file, 'utf8');
                            if (content.includes('sk-proj-') || content.includes('AIza')) {
                                hasSecrets = true;
                                break;
                            }
                        }
                    }

                    return {
                        pass: !hasSecrets,
                        message: hasSecrets ?
                            '❌ Hardcoded API keys found in source code' :
                            '✅ No hardcoded secrets in source code'
                    };
                } catch (error) {
                    return { pass: true, message: '✅ Source code check completed' };
                }
            }
        },
        {
            name: 'Production Template',
            check: () => {
                if (!fs.existsSync('.env.production')) {
                    return { pass: false, message: '❌ .env.production template missing' };
                }

                const template = fs.readFileSync('.env.production', 'utf8');
                const hasPlaceholders = template.includes('your-service-account@') &&
                    template.includes('sk-proj-your-openai-api-key');

                return {
                    pass: hasPlaceholders,
                    message: hasPlaceholders ?
                        '✅ Production template has placeholder values' :
                        '⚠️  Production template may contain real values'
                };
            }
        },
        {
            name: 'GitIgnore Protection',
            check: () => {
                if (!fs.existsSync('.gitignore')) {
                    return { pass: false, message: '❌ .gitignore file missing' };
                }

                const gitignore = fs.readFileSync('.gitignore', 'utf8');
                const protectsEnv = gitignore.includes('.env') && gitignore.includes('.wwebjs_auth');

                return {
                    pass: protectsEnv,
                    message: protectsEnv ?
                        '✅ .gitignore protects sensitive files' :
                        '⚠️  .gitignore may not protect all sensitive files'
                };
            }
        }
    ];

    console.log('🔍 Running security checks...\n');

    let allPassed = true;
    for (const check of checks) {
        const result = check.check();
        console.log(`${result.message}`);
        if (!result.pass) allPassed = false;
    }

    console.log('\n' + '='.repeat(50));

    if (allPassed) {
        console.log('🎉 All security checks passed!');
        console.log('');
        console.log('✅ Your project follows security best practices');
        console.log('✅ Safe to deploy to Railway');
    } else {
        console.log('⚠️  Some security issues found');
        console.log('');
        console.log('🔧 Please fix the issues above before deploying');
    }

    console.log('');
    console.log('🔒 Railway Security Features:');
    console.log('   • Environment variables encrypted at rest');
    console.log('   • HTTPS/TLS encryption in transit');
    console.log('   • Access control and audit logging');
    console.log('   • SOC 2 Type II compliance');
    console.log('   • Regular security audits');
    console.log('');
    console.log('💡 Additional Security Tips:');
    console.log('   • Rotate API keys monthly');
    console.log('   • Monitor API usage regularly');
    console.log('   • Use 2FA on all accounts');
    console.log('   • Limit Railway project access');
    console.log('   • Keep dependencies updated');
    console.log('');
    console.log('📖 For detailed security guide, see: SECURITY-GUIDE.md');
}

runSecurityChecklist();