# Render Backend Deployment Status

## ✅ Completed

1. **PostgreSQL Database Created**
   - Database Name: `soulmate-b2b-db`
   - Database ID: `dpg-d4i1l42li9vc73eghfag-a`
   - Status: ✅ Created successfully
   - Region: Oregon (US West)
   - Plan: Free tier

## 🔄 In Progress

2. **Web Service Creation**
   - Need to create a new web service for the FastAPI backend
   - Repository: Connect to GitHub repository
   - Build Command: `cd web_app/backend && pip install -r requirements.txt`
   - Start Command: `cd web_app/backend && uvicorn app:app --host 0.0.0.0 --port $PORT`

## 📋 Manual Steps Required

Since browser automation encountered issues with Render's interface, please complete these steps manually:

### Step 1: Create Web Service

1. Go to https://dashboard.render.com/new/web-service
2. Connect your GitHub repository (the "soul mate" repository)
3. Configure the service:
   - **Name**: `soulmate-b2b-api`
   - **Region**: Oregon (US West) - same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `web_app/backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

### Step 2: Link Database

1. In the web service settings, go to "Environment" section
2. Click "Add Environment Variable"
3. Add: `DATABASE_URL` - This will be automatically populated when you link the database
4. Go to "Connections" section
5. Click "Link Database"
6. Select `soulmate-b2b-db`
7. The `DATABASE_URL` will be automatically set

### Step 3: Add Additional Environment Variables

Add these environment variables in the web service settings:

```
ENVIRONMENT=production
ALLOWED_ORIGINS=https://soulmate.syncscript.app,https://www.soulmate.syncscript.app
JWT_SECRET_KEY=<generate a secure random string>
JWT_SECRET_KEY>
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=10080
REDIS_URL=<your-redis-url-if-using-redis>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
```

### Step 4: Initialize Database

After the service is deployed, you'll need to run the database initialization:

1. Go to the service's "Shell" tab
2. Run: `python -c "from database.connection import init_db; init_db()"`

Or create a one-time script to initialize the database schema.

### Step 5: Test Deployment

Once deployed, test the endpoints:
- Health check: `https://your-service.onrender.com/health`
- API docs: `https://your-service.onrender.com/docs`

## 📝 Notes

- The database is already created and ready to use
- The database connection string will be automatically available as `DATABASE_URL` when linked
- Make sure the web service and database are in the same region (Oregon)
- The free tier database will expire on December 24, 2025 - upgrade to a paid plan for production use

## 🔗 Useful Links

- Database Dashboard: https://dashboard.render.com/d/dpg-d4i1l42li9vc73eghfag-a
- Render Dashboard: https://dashboard.render.com/
- Render Docs: https://render.com/docs

