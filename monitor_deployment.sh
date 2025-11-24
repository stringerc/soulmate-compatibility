#!/bin/bash
# Deployment Monitoring Script
# Checks deployment status and waits for success

echo "🔍 Monitoring Render deployment..."
echo "Service: soulmate-b2b-api"
echo "URL: https://soulmate-b2b-api.onrender.com"
echo ""
echo "Checking health endpoint..."

MAX_ATTEMPTS=60
ATTEMPT=0
SUCCESS=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo ""
    echo "[Attempt $ATTEMPT/$MAX_ATTEMPTS] Checking deployment status..."
    
    # Check health endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://soulmate-b2b-api.onrender.com/health 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ SUCCESS! Deployment is live!"
        echo "Health check returned: $HTTP_CODE"
        curl -s https://soulmate-b2b-api.onrender.com/health | jq . 2>/dev/null || curl -s https://soulmate-b2b-api.onrender.com/health
        SUCCESS=true
        break
    elif [ "$HTTP_CODE" = "000" ]; then
        echo "⏳ Service not responding yet (connection failed or still deploying)..."
    else
        echo "⚠️  Service responding but returned HTTP $HTTP_CODE (may still be starting up)..."
    fi
    
    echo "Waiting 30 seconds before next check..."
    sleep 30
done

if [ "$SUCCESS" = false ]; then
    echo ""
    echo "❌ Deployment check timed out after $MAX_ATTEMPTS attempts"
    echo "Please check Render dashboard for deployment status:"
    echo "https://dashboard.render.com/web/soulmate-b2b-api"
    exit 1
else
    echo ""
    echo "🎉 Deployment successful! Service is live at:"
    echo "https://soulmate-b2b-api.onrender.com"
    exit 0
fi

