/**
 * PM2 Ecosystem Configuration
 * Professional process management for Birthday WhatsApp Messenger
 */

module.exports = {
    apps: [{
        name: 'birthday-whatsapp-messenger',
        script: 'dist/index.js',
        cwd: __dirname,
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            WHATSAPP_TEST_MODE: 'false',
            COMPLETE_TEST_MODE: 'false'
        },
        log_file: './logs/combined.log',
        out_file: './logs/out.log',
        error_file: './logs/error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        time: true
    }]
};