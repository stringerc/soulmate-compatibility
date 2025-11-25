#!/bin/bash

# Google OAuth Redirect URI Automation Helper
# Updated with new Client ID

echo "🔧 Google OAuth Redirect URI Automation"
echo "========================================"
echo ""
echo "Opening Google Cloud Console..."
echo ""

# Open Google Cloud Console in default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "https://console.cloud.google.com/apis/credentials?project=$(gcloud config get-value project 2>/dev/null || echo '')"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "https://console.cloud.google.com/apis/credentials" 2>/dev/null || \
    sensible-browser "https://console.cloud.google.com/apis/credentials" 2>/dev/null || \
    echo "Please open: https://console.cloud.google.com/apis/credentials"
else
    echo "Please open: https://console.cloud.google.com/apis/credentials"
fi

echo ""
echo "📋 Instructions:"
echo "1. Make sure you're logged into Google Cloud Console"
echo "2. Find your OAuth 2.0 Client ID:"
echo "   Client ID: 739263757591-f5mrjkesqg66pno8ni2oj5e1j0spn61h.apps.googleusercontent.com"
echo "3. Click on it to edit"
echo "4. Scroll to 'Authorized redirect URIs'"
echo "5. Click '+ ADD URI'"
echo "6. Enter: http://localhost:3000/api/auth/callback/google"
echo "7. Click 'SAVE'"
echo ""
echo "✅ Done! Then restart your dev server."
echo ""
