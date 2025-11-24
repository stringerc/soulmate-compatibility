#!/bin/bash
# Test script for API endpoints

set -e

API_URL="${API_URL:-http://localhost:8000}"
API_KEY="${API_KEY:-}"

echo "🧪 Testing API Endpoints..."
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test health endpoint
echo "1. Testing health endpoint..."
if curl -s "$API_URL/health" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

# Test root endpoint
echo "2. Testing root endpoint..."
if curl -s "$API_URL/" | grep -q "Soulmate"; then
    echo -e "${GREEN}✅ Root endpoint works${NC}"
else
    echo -e "${RED}❌ Root endpoint failed${NC}"
fi

# Test partner creation (if no API key needed)
if [ -z "$API_KEY" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  API_KEY not set. Skipping authenticated endpoints.${NC}"
    echo "Set API_KEY environment variable to test authenticated endpoints."
    exit 0
fi

# Test compatibility calculation
echo "3. Testing compatibility calculation..."
RESPONSE=$(curl -s -X POST "$API_URL/api/v1/compatibility/calculate" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {"traits": [0.5] * 32},
    "person2": {"traits": [0.6] * 32}
  }')

if echo "$RESPONSE" | grep -q "compatibility_score"; then
    echo -e "${GREEN}✅ Compatibility API works${NC}"
    echo "Response: $(echo $RESPONSE | jq -r '.compatibility_score')"
else
    echo -e "${RED}❌ Compatibility API failed${NC}"
    echo "Response: $RESPONSE"
fi

echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"

