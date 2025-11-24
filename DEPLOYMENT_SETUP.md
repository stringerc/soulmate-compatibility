# Complete Deployment Setup Guide

## 🚀 Quick Start Deployment

This guide walks you through deploying the complete B2B monetization system to production.

---

## Prerequisites

- GitHub account (code is already pushed)
- Render account (for backend + database)
- Vercel account (for frontend)
- Stripe account (optional, for billing)

---

## Step 1: Set Up PostgreSQL Database

### Option A: Render (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Name: `soulmate-b2b-db`
   - Database: `soulmate_b2b`
   - User: `soulmate_user`
   - Region: Choose closest to your users
   - Plan: Starter (free) or upgrade as needed
3. **Copy Connection String**:
   - Go to database settings
   - Copy "Internal Database URL" (for Render services)
   - Copy "External Database URL" (for local testing)

### Option B: Railway

1. **Go to Railway Dashboard**: https://railway.app
2. **Create New Project** → "New Database" → "PostgreSQL"
3. **Copy Connection String** from database settings

### Option C: Local Development

```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Linux

# Start PostgreSQL
brew services start postgresql  # macOS

# Create database
createdb soulmate_b2b

# Run schema
psql soulmate_b2b < web_app/backend/database/schema.sql
```

---

## Step 2: Deploy Backend API (Render)

### 2.1 Create Web Service

1. **Go to Render Dashboard** → "New +" → "Web Service"
2. **Connect GitHub Repository**:
   - Select `soulmate-compatibility` repository
   - Branch: `main`
3. **Configure Service**:
   - **Name**: `soulmate-b2b-api`
   - **Root Directory**: `web_app/backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

### 2.2 Set Environment Variables

In Render dashboard, add these environment variables:

```bash
# Database
DATABASE_URL=<your_postgresql_connection_string>

# Environment
ENVIRONMENT=production
ALLOWED_ORIGINS=https://soulmates.syncscript.app,https://soulmate.syncscript.app

# JWT Secret (generate a secure random string)
JWT_SECRET_KEY=<generate_secure_random_string_here>

# Stripe (optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Port (auto-set by Render)
PORT=8000
```

**Generate JWT Secret**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.3 Deploy

1. Click "Create Web Service"
2. Wait for build to complete (~2-3 minutes)
3. Copy the service URL (e.g., `https://soulmate-b2b-api.onrender.com`)

### 2.4 Initialize Database

After deployment, initialize the database:

```bash
# Option 1: Via Render Shell
# Go to Render dashboard → Your service → Shell
python scripts/init_db.py

# Option 2: Via local connection (if external URL available)
export DATABASE_URL="<external_database_url>"
cd web_app/backend
python scripts/init_db.py
```

---

## Step 3: Deploy Frontend (Vercel)

### 3.1 Connect Repository

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Import Project**:
   - Select `soulmate-compatibility` repository
   - Framework Preset: **Next.js**
   - Root Directory: `web_app/frontend`

### 3.2 Configure Environment Variables

Add environment variable:

```bash
NEXT_PUBLIC_API_URL=https://soulmate-b2b-api.onrender.com
```

(Replace with your actual backend URL)

### 3.3 Deploy

1. Click "Deploy"
2. Wait for build (~1-2 minutes)
3. Your site will be live at: `https://soulmate-compatibility.vercel.app`
4. **Add Custom Domain**: `soulmates.syncscript.app` (if not already configured)

---

## Step 4: Test Deployment

### 4.1 Test Backend Health

```bash
curl https://soulmate-b2b-api.onrender.com/health
```

Expected response:
```json
{"status": "healthy", "service": "soulmate-b2b-api"}
```

### 4.2 Test Frontend

1. Visit: `https://soulmates.syncscript.app`
2. Test user-facing app (should work)
3. Visit: `https://soulmates.syncscript.app/partner`
4. Test partner portal (onboarding flow)

### 4.3 Test API Endpoints

**Create Partner**:
```bash
curl -X POST https://soulmate-b2b-api.onrender.com/api/v1/partners/ \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "email": "test@example.com",
    "tier": "starter"
  }'
```

**Create API Key** (replace `{partner_id}`):
```bash
curl -X POST https://soulmate-b2b-api.onrender.com/api/v1/partners/{partner_id}/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key"}'
```

**Test Compatibility API** (replace `{api_key}`):
```bash
curl -X POST https://soulmate-b2b-api.onrender.com/api/v1/compatibility/calculate \
  -H "X-API-Key: {api_key}" \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {"traits": [0.5] * 32},
    "person2": {"traits": [0.6] * 32}
  }'
```

---

## Step 5: Configure Stripe (Optional)

### 5.1 Set Up Stripe Account

1. **Create Stripe Account**: https://stripe.com
2. **Get API Keys**:
   - Go to Developers → API Keys
   - Copy "Secret key" (starts with `sk_live_`)

### 5.2 Configure Webhook

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add Endpoint**:
   - URL: `https://soulmate-b2b-api.onrender.com/api/v1/webhooks/stripe`
   - Events to listen:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
3. **Copy Webhook Secret** (starts with `whsec_`)

### 5.3 Update Environment Variables

Add to Render backend environment:
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Step 6: Final Configuration

### 6.1 Update Frontend API URL

If backend URL changed, update Vercel environment variable:
```bash
NEXT_PUBLIC_API_URL=https://your-actual-backend-url.onrender.com
```

### 6.2 Update CORS Settings

In Render backend, ensure `ALLOWED_ORIGINS` includes:
```bash
ALLOWED_ORIGINS=https://soulmates.syncscript.app,https://soulmate.syncscript.app
```

### 6.3 Test Complete Flow

1. **User Flow**:
   - Visit `https://soulmates.syncscript.app`
   - Complete story quest
   - View results
   - Share results

2. **Partner Flow**:
   - Visit `https://soulmates.syncscript.app/partner`
   - Complete onboarding
   - Create API key
   - Test API endpoints
   - View usage analytics

---

## Troubleshooting

### Database Connection Issues

**Error**: `could not connect to server`

**Solutions**:
1. Check `DATABASE_URL` is correct
2. For Render: Use "Internal Database URL" (not external)
3. Verify database is running
4. Check firewall/network settings

### API Not Responding

**Error**: `502 Bad Gateway` or timeout

**Solutions**:
1. Check Render service logs
2. Verify `PORT` environment variable
3. Check start command is correct
4. Verify database is accessible

### Frontend Can't Connect to Backend

**Error**: `Failed to fetch` or CORS errors

**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check `ALLOWED_ORIGINS` in backend
3. Verify backend is running
4. Check CORS middleware configuration

### Database Schema Not Created

**Error**: Tables don't exist

**Solutions**:
1. Run `python scripts/init_db.py` manually
2. Check database connection
3. Verify schema.sql is correct
4. Check Render logs for errors

---

## Monitoring & Maintenance

### Backend Monitoring

1. **Render Dashboard**:
   - View logs
   - Monitor metrics
   - Check deployment status

2. **Health Checks**:
   - Set up monitoring for `/health` endpoint
   - Configure alerts for downtime

### Database Monitoring

1. **Render Database Dashboard**:
   - Monitor connections
   - Check query performance
   - View database size

2. **Backup**:
   - Render auto-backups (daily)
   - Manual backups available

### Frontend Monitoring

1. **Vercel Dashboard**:
   - View analytics
   - Check build logs
   - Monitor performance

---

## Cost Estimates

### Render (Backend + Database)

- **Web Service**: Free tier (750 hours/month) or $7/month
- **PostgreSQL**: Free tier (90 days) or $7/month
- **Total**: $0-14/month

### Vercel (Frontend)

- **Hobby Plan**: Free (unlimited)
- **Pro Plan**: $20/month (if needed)

### Stripe

- **No monthly fee**
- **2.9% + $0.30 per transaction**

**Total Estimated Cost**: $0-34/month (depending on usage)

---

## Next Steps After Deployment

1. **Test All Endpoints**: Use `/api-test` page
2. **Create First Partner**: Test onboarding flow
3. **Generate API Keys**: Test API authentication
4. **Monitor Usage**: Check analytics dashboard
5. **Set Up Alerts**: Configure error notifications
6. **Documentation**: Share API docs with partners

---

## Support & Resources

- **Backend Logs**: Render Dashboard → Your Service → Logs
- **Frontend Logs**: Vercel Dashboard → Your Project → Deployments → Logs
- **Database Logs**: Render Dashboard → Database → Logs
- **API Documentation**: `https://soulmates.syncscript.app/docs`
- **API Testing**: `https://soulmates.syncscript.app/api-test`

---

**Deployment Complete! 🎉**

Your B2B monetization system is now live and ready to generate revenue!

