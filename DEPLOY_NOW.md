# 🚀 Deploy Now - Step-by-Step Instructions

## ⚡ Quick Deployment (5 Minutes)

Follow these exact steps to deploy your B2B monetization system.

---

## Part 1: Backend Deployment (Render) - 3 minutes

### Step 1: Create Database (1 minute)

1. **Go to**: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name**: `soulmate-b2b-db`
   - **Database**: `soulmate_b2b`
   - **User**: `soulmate_user`
   - **Plan**: Starter (free)
4. Click **"Create Database"**
5. **Copy "Internal Database URL"** (looks like: `postgresql://user:pass@host/dbname`)

### Step 2: Deploy Backend (2 minutes)

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. **Connect GitHub**:
   - Click "Connect account" if needed
   - Select repository: `soulmate-compatibility`
   - Branch: `main`
3. **Configure**:
   - **Name**: `soulmate-b2b-api`
   - **Root Directory**: `web_app/backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables** (click "Advanced"):
   ```
   DATABASE_URL = <paste_internal_database_url>
   ENVIRONMENT = production
   ALLOWED_ORIGINS = https://soulmates.syncscript.app,https://soulmate.syncscript.app
   JWT_SECRET_KEY = Cq3AzffklZQeuQTN6FijbmCodWFlWL0laoq9WWmV7JQ
   ```
5. Click **"Create Web Service"**
6. **Wait 2-3 minutes** for deployment
7. **Copy your service URL** (e.g., `https://soulmate-b2b-api.onrender.com`)

### Step 3: Initialize Database (30 seconds)

1. Go to your service → **"Shell"** tab
2. Run:
   ```bash
   python scripts/init_db.py
   ```
3. Should see: `✅ Database tables created successfully`

---

## Part 2: Frontend Deployment (Vercel) - 2 minutes

### Step 1: Deploy (1 minute)

1. **Go to**: https://vercel.com
2. Click **"Add New"** → **"Project"**
3. **Import Git Repository**:
   - Select: `soulmate-compatibility`
   - Click **"Import"**
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `web_app/frontend` ⚠️ **IMPORTANT**
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
5. **Environment Variables**:
   - Click **"Environment Variables"**
   - Add:
     - **Key**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://soulmate-b2b-api.onrender.com` (your backend URL from Part 1)
6. Click **"Deploy"**
7. **Wait 1-2 minutes**

### Step 2: Configure Domain (30 seconds)

1. Go to **Project Settings** → **"Domains"**
2. Add: `soulmates.syncscript.app`
3. Follow DNS instructions (if needed)
4. Wait for SSL (~1 minute)

---

## Part 3: Test Everything (1 minute)

### Test Backend
```bash
curl https://soulmate-b2b-api.onrender.com/health
```
Should return: `{"status": "healthy"}`

### Test Frontend
Visit: `https://soulmates.syncscript.app`

Test these pages:
- ✅ `/` - Main app works
- ✅ `/partner` - Partner portal loads
- ✅ `/docs` - Documentation loads
- ✅ `/api-test` - API testing works

---

## ✅ Deployment Complete!

**Your system is now live!**

### What's Deployed:

✅ **Backend API**: `https://soulmate-b2b-api.onrender.com`
✅ **Frontend**: `https://soulmates.syncscript.app`
✅ **Partner Portal**: `https://soulmates.syncscript.app/partner`
✅ **API Docs**: `https://soulmates.syncscript.app/docs`
✅ **API Testing**: `https://soulmates.syncscript.app/api-test`

---

## 🎯 Next Steps

1. **Test Partner Onboarding**:
   - Go to `/partner`
   - Create test account
   - Generate API key
   - Test API endpoints

2. **Share with Users**:
   - Main app is live and free
   - Share `soulmates.syncscript.app`

3. **Onboard Partners**:
   - Share partner portal URL
   - Provide API documentation
   - Start generating revenue!

---

## 🆘 Need Help?

**Backend Issues:**
- Check Render logs: Dashboard → Service → Logs
- Verify environment variables
- Check database connection

**Frontend Issues:**
- Check Vercel build logs: Dashboard → Project → Deployments
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check for build errors

**API Issues:**
- Test with `/api-test` page
- Check API key is valid
- Verify rate limits

---

**Ready to deploy! Follow the steps above. 🚀**

