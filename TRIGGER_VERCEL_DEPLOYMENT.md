# 🚀 Trigger Vercel Deployment - Multiple Methods

## Current Status
- ✅ Root Directory: `web_app/frontend` (CORRECT)
- ✅ Commits on GitHub: Latest is `2ec468c`
- ❌ Vercel not auto-deploying

## Method 1: Vercel CLI (If Available)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy from Correct Directory
```bash
cd web_app/frontend
vercel --prod
```

---

## Method 2: Vercel API (Direct Trigger)

### Get Vercel API Token
1. Go to: https://vercel.com/account/tokens
2. Create new token
3. Copy token

### Trigger Deployment via API
```bash
# Set your token and run:
VERCEL_TOKEN="your-token-here"
PROJECT_ID="soulmate-compatibility"  # or get from Vercel dashboard
TEAM_ID="christopher-stringers-projects"  # or personal account

# Trigger deployment
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "soulmate-compatibility",
    "gitSource": {
      "type": "github",
      "repo": "stringerc/soulmate-compatibility",
      "ref": "main"
    },
    "projectSettings": {
      "rootDirectory": "web_app/frontend"
    }
  }'
```

---

## Method 3: GitHub Actions (Automated)

Create `.github/workflows/vercel-deploy.yml`:

```yaml
name: Trigger Vercel Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./web_app/frontend
```

---

## Method 4: Manual Dashboard (Easiest)

1. **Vercel Dashboard** → Deployments
2. **"Create Deployment"**
3. **Branch**: `main`
4. **Commit**: Select latest (`2ec468c`)
5. **Root Directory**: Verify `web_app/frontend`
6. **Deploy**

---

## Method 5: Check Webhook Status

**GitHub Webhook Check:**
1. GitHub → `stringerc/soulmate-compatibility` → Settings → Webhooks
2. Find Vercel webhook
3. Check "Recent Deliveries"
4. See if webhooks are failing

**If webhook failing:**
- Reconnect GitHub in Vercel Settings → Git

---

## Recommended: Try Method 4 First

**Manual deployment via dashboard is fastest:**
1. Takes 2 minutes
2. No setup needed
3. Immediate result
4. Then investigate why auto-deploy isn't working

---

## After Manual Deploy Works

**Then fix auto-deploy:**
1. Check webhook status
2. Reconnect GitHub if needed
3. Verify auto-deploy enabled
4. Test with empty commit

