#!/bin/bash

# Setup System Cron for Birthday WhatsApp Messenger
# This script sets up a system cron job to run the birthday app daily at 4 AM

echo "🔧 Setting up System Cron for Birthday WhatsApp Messenger"
echo "========================================================="

# Get the current directory (where the project is located)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Project directory: $PROJECT_DIR"

# Create the cron job command
CRON_COMMAND="0 4 * * * cd $PROJECT_DIR && node run-once.js >> logs/cron-\$(date +\%Y-\%m-\%d).log 2>&1"

echo ""
echo "📅 Cron job to be added:"
echo "$CRON_COMMAND"
echo ""

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "run-once.js"; then
    echo "⚠️  Cron job already exists. Removing old one..."
    crontab -l 2>/dev/null | grep -v "run-once.js" | crontab -
fi

# Add the new cron job
echo "➕ Adding cron job..."
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -

# Verify the cron job was added
echo ""
echo "✅ Cron job added successfully!"
echo ""
echo "📋 Current cron jobs:"
crontab -l | grep -E "(run-once|birthday)"

echo ""
echo "🎯 Setup complete!"
echo ""
echo "📅 Your birthday app will now run automatically every day at 4:00 AM"
echo "📄 Logs will be saved to: $PROJECT_DIR/logs/"
echo ""
echo "🔧 To remove the cron job later:"
echo "   crontab -e"
echo "   (then delete the line with 'run-once.js')"
echo ""
echo "🔍 To check cron job status:"
echo "   crontab -l"
echo ""
echo "📊 To view logs:"
echo "   tail -f $PROJECT_DIR/logs/cron-\$(date +%Y-%m-%d).log"