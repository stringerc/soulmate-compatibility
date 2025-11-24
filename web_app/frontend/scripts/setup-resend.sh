#!/bin/bash

# Resend API Setup Script for Vercel
# This script helps verify Resend configuration

echo "🔧 Resend API Setup Verification"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

echo "📋 Required Environment Variables:"
echo ""
echo "1. RESEND_API_KEY"
echo "   Value: re_iZLn4keZ_PdNvDBdYS9HK1Tu8MMddvaFz"
echo "   Status: $(if [ -z "$RESEND_API_KEY" ]; then echo "❌ Not set"; else echo "✅ Set"; fi)"
echo ""
echo "2. RESEND_FROM_EMAIL"
echo "   Value: noreply@soulmates.syncscript.app"
echo "   Status: $(if [ -z "$RESEND_FROM_EMAIL" ]; then echo "❌ Not set"; else echo "✅ Set"; fi)"
echo ""
echo "3. NEXT_PUBLIC_APP_URL"
echo "   Value: https://soulmates.syncscript.app"
echo "   Status: $(if [ -z "$NEXT_PUBLIC_APP_URL" ]; then echo "❌ Not set"; else echo "✅ Set"; fi)"
echo ""

echo "📝 Next Steps:"
echo ""
echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Select your project: soulmate-compatibility"
echo "3. Go to Settings → Environment Variables"
echo "4. Add the three variables listed above"
echo "5. Redeploy your project"
echo ""
echo "📚 For detailed instructions, see: RESEND_SETUP.md"
echo ""

