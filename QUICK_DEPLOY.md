# 🚀 Quick Deployment Guide

## Step-by-Step Deployment Instructions

Follow these steps to deploy your B2B monetization system to production.

---

## Part 1: Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. **Go to Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `soulmate-b2b-db`
   - **Database**: `soulmate_b2b`
   - **User**: `soulmate_user`
   - **Region**: Choose closest to your users
   - **Plan**: Starter (free for 90 days)
4. Click **"Create Database"**
5. **Copy the "Internal Database URL"** (you'll need this)

### Step 2: Deploy Backend API

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. **Connect GitHub**:
   - Select your `soulmate-compatibility` repository
   - Branch: `main`
3. **Configure Service**:
   - **Name**: `soulmate-b2b-api`
   - **Root Directory**: `web_app/backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. **Add Environment Variables**:
   ```
   DATABASE_URL=<paste_internal_database_url_from_step_1>
   ENVIRONMENT=production
   ALLOWED_ORIGINS=https://soulmates.syncscript.app,https://soulmate.syncscript.app
   JWT_SECRET_KEY=<generate_with_command_below>
   ```
5. **Generate JWT Secret** (run locally):
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   Copy the output and paste as `JWT_SECRET_KEY`
6. Click **"Create Web Service"**
7. Wait for deployment (~2-3 minutes)
8. **Copy your service URL** (e.g., `https://soulmate-b2b-api.onrender.com`)

### Step 3: Initialize Database

After backend is deployed:

1. Go to your service → **"Shell"** tab
2. Run:
   ```bash
   python scripts/init_db.py
   ```
3. Or run locally (if you have external database URL):
   ```bash
   export DATABASE_URL="<external_database_url>"
   cd web_app/backend
   python scripts/init_db.py
   ```

### Step 4: Test Backend

```bash
curl https://your-service-url.onrender.com/health
```

Should return: `{"status": "healthy", "service": "soulmate-b2b-api"}`

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. Click **"Add New"** → **"Project"**
3. **Import Git Repository**:
   - Select `soulmate-compatibility`
   - Click **"Import"**
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `web_app/frontend`
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
5. **Add Environment Variable**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (from Part 1, Step 2)
6. Click **"Deploy"**
7. Wait for deployment (~1-2 minutes)

### Step 2: Configure Custom Domain

1. Go to Project Settings → **"Domains"**
2. Add domain: `soulmates.syncscript.app`
3. Follow DNS instructions (if needed)
4. Wait for SSL certificate (~1-2 minutes)

### Step 3: Test Frontend

Visit: `https://soulmates.syncscript.app`

Test pages:
- `/` - Main app
- `/partner` - Partner portal
- `/docs` - API docs
- `/api-test` - API testing

---

## Part 3: Testing & Verification

### Test User-Facing App

1. Visit: `https://soulmates.syncscript.app`
2. Complete story quest for Person 1
3. Complete story quest for Person 2
4. View results
5. Test sharing functionality

### Test Partner Portal

1. Visit: `https://soulmates.syncscript.app/partner`
2. Complete onboarding:
   - Company name: "Test Company"
   - Email: your-email@example.com
   - Tier: Starter
3. Create API key
4. Copy API key (shown only once!)

### Test API Endpoints

1. Visit: `https://soulmates.syncscript.app/api-test`
2. Paste your API key
3. Enter trait vectors (or use defaults)
4. Click "Test API"
5. Verify response shows compatibility score

### Test via cURL

```bash
# Replace YOUR_API_KEY with actual key
curl -X POST https://your-backend-url.onrender.com/api/v1/compatibility/calculate \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {"traits": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]},
    "person2": {"traits": [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6]}
  }'
```

---

## Part 4: Optional - Stripe Setup

### If you want billing integration:

1. **Create Stripe Account**: https://stripe.com
2. **Get API Keys**:
   - Go to Developers → API Keys
   - Copy "Secret key" (starts with `sk_live_`)
3. **Set Up Webhook**:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-backend-url.onrender.com/api/v1/webhooks/stripe`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy webhook secret (starts with `whsec_`)
4. **Add to Render Environment Variables**:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. **Redeploy** backend service

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database created on Render
- [ ] Backend service deployed to Render
- [ ] Database schema initialized
- [ ] Backend health check passes
- [ ] Frontend deployed to Vercel
- [ ] Custom domain configured
- [ ] Environment variables set
- [ ] User-facing app tested
- [ ] Partner portal tested
- [ ] API endpoints tested
- [ ] Documentation accessible
- [ ] API testing interface works

---

## 🎉 Deployment Complete!

Your B2B monetization system is now live!

**Next Steps:**
1. Share partner portal URL with potential partners
2. Create marketing materials
3. Start onboarding partners
4. Monitor usage and analytics
5. Scale as needed

**Support Resources:**
- Backend Logs: Render Dashboard → Your Service → Logs
- Frontend Logs: Vercel Dashboard → Your Project → Deployments → Logs
- API Docs: https://soulmates.syncscript.app/docs
- Testing: https://soulmates.syncscript.app/api-test

---

## 🆘 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify `DATABASE_URL` is correct
- Check Python version (3.11+)
- Verify all dependencies in requirements.txt

### Frontend build fails
- Check Vercel build logs
- Verify Node.js version (18+)
- Check for TypeScript errors
- Verify environment variables

### Database connection fails
- Verify `DATABASE_URL` format
- Check database is running
- Use "Internal Database URL" for Render services
- Check firewall settings

### API returns 401/403
- Verify API key is correct
- Check API key hasn't been revoked
- Verify partner account is active
- Check rate limits haven't been exceeded

---

**Ready to deploy! Follow the steps above. 🚀**

