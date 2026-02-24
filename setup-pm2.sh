#!/bin/bash

# Setup PM2 Process Manager for Birthday WhatsApp Messenger
# PM2 provides professional process management with auto-restart, logging, and monitoring

echo "🚀 Setting up PM2 for Birthday WhatsApp Messenger"
echo "================================================="

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 not found. Installing PM2..."
    npm install -g pm2
    echo "✅ PM2 installed successfully"
else
    echo "✅ PM2 is already installed"
fi

# Create logs directory
mkdir -p logs

# Build the project
echo "🔨 Building project..."
npm run build

# Stop any existing PM2 process
echo "🛑 Stopping any existing processes..."
pm2 stop birthday-whatsapp-messenger 2>/dev/null || true
pm2 delete birthday-whatsapp-messenger 2>/dev/null || true

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on system boot
echo "🔄 Setting up PM2 startup script..."
pm2 startup

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "🔧 Useful PM2 Commands:"
echo "   pm2 status                    # Check application status"
echo "   pm2 logs birthday-whatsapp    # View live logs"
echo "   pm2 restart birthday-whatsapp # Restart application"
echo "   pm2 stop birthday-whatsapp    # Stop application"
echo "   pm2 start birthday-whatsapp   # Start application"
echo "   pm2 monit                     # Monitor resources"
echo ""
echo "📄 Log files location: ./logs/"
echo "📅 The app will run daily at 4:00 AM IST automatically"
echo "🔄 PM2 will auto-restart the app if it crashes"