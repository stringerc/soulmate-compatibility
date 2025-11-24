# Render Deployment Automation Guide

## 🎯 Overview

This guide provides multiple automated methods to deploy the Soulmate B2B API to Render.com, following best practices and strategic approaches.

## ✅ What's Already Done

1. **PostgreSQL Database Created**
   - Database ID: `dpg-d4i1l42li9vc73eghfag-a`
   - Name: `soulmate-b2b-db`
   - Region: Oregon (US West)
   - Status: ✅ Active

2. **Infrastructure as Code**
   - `render.yaml` created with full service configuration
   - Database schema defined
   - Environment variables configured

3. **Automation Scripts**
   - `scripts/deploy_render.sh` - Shell script using Render CLI
   - `scripts/deploy_render_api.py` - Python script using Render API
   - `web_app/backend/scripts/init_db.py` - Database initialization script

## 🚀 Deployment Methods (Ranked by Automation Level)

### Method 1: Render Blueprint (Most Automated) ⭐ RECOMMENDED

**Best for**: Fully automated, version-controlled deployments

**Steps**:

1. **Get Render API Key**:
   ```bash
   # Go to: https://dashboard.render.com/account/api-keys
   # Create a new API key
   export RENDER_API_KEY=your_api_key_here
   ```

2. **Deploy via Blueprint**:
   ```bash
   # Option A: Using Render Dashboard
   # Go to: https://dashboard.render.com/new/blueprint
   # Paste your GitHub repo URL: https://github.com/your-username/soul-mate
   # Render will detect render.yaml and deploy automatically
   
   # Option B: Using Render CLI
   python scripts/deploy_render_api.py
   ```

**Advantages**:
- ✅ Fully automated
- ✅ Version controlled (render.yaml)
- ✅ Reproducible deployments
- ✅ Database linking handled automatically
- ✅ Environment variables managed in code

### Method 2: Render CLI (Semi-Automated)

**Best for**: Command-line automation with manual oversight

**Steps**:

1. **Install Render CLI**:
   ```bash
   curl -fsSL https://render.com/cli.sh | bash
   ```

2. **Login**:
   ```bash
   render login
   ```

3. **Deploy**:
   ```bash
   ./scripts/deploy_render.sh
   ```

**Advantages**:
- ✅ Uses render.yaml
- ✅ Command-line friendly
- ✅ Good for CI/CD integration

### Method 3: Render API (Programmatic)

**Best for**: Custom automation, CI/CD pipelines

**Steps**:

1. **Set API Key**:
   ```bash
   export RENDER_API_KEY=your_api_key_here
   export GITHUB_REPO_URL=https://github.com/your-username/soul-mate
   ```

2. **Run Script**:
   ```bash
   python scripts/deploy_render_api.py
   ```

**Advantages**:
- ✅ Full programmatic control
- ✅ Can be integrated into CI/CD
- ✅ Customizable deployment logic

### Method 4: Manual Dashboard (Fallback)

**Best for**: One-time setup, troubleshooting

See `RENDER_DEPLOYMENT_STATUS.md` for manual steps.

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository is public or Render has access
- [ ] `render.yaml` is committed to repository
- [ ] Database is created (✅ Already done)
- [ ] Render API key obtained (for automated methods)
- [ ] Environment variables documented

## 🔧 Post-Deployment Steps

### 1. Initialize Database Schema

After deployment, initialize the database:

```bash
# Via Render Shell (in dashboard)
cd web_app/backend
python scripts/init_db.py

# Or via Render API
# The app will auto-initialize on first startup (configured in app.py)
```

### 2. Verify Deployment

```bash
# Health check
curl https://your-service.onrender.com/health

# API docs
open https://your-service.onrender.com/docs
```

### 3. Set Additional Environment Variables

In Render Dashboard → Service → Environment:
- `JWT_SECRET_KEY` - Generate a secure random string
- `STRIPE_SECRET_KEY` - Your Stripe secret key (if using payments)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `REDIS_URL` - Redis connection string (if using Redis)

## 🔐 Security Best Practices

1. **API Keys**: Never commit API keys to repository
2. **Environment Variables**: Use Render's encrypted environment variables
3. **Database**: Database URL is automatically secured by Render
4. **CORS**: Configured in `render.yaml` for production domains only

## 📊 Monitoring & Maintenance

### Health Checks
- Health endpoint: `/health` (configured in render.yaml)
- Render automatically monitors this endpoint

### Logs
- View logs in Render Dashboard → Service → Logs
- Or use Render CLI: `render logs <service-name>`

### Database Backups
- Free tier: Manual backups recommended
- Paid tiers: Automatic backups included

## 🚨 Troubleshooting

### Service Won't Start
1. Check logs: `render logs soulmate-b2b-api`
2. Verify build command: `pip install -r requirements.txt`
3. Check start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

### Database Connection Issues
1. Verify database is linked in service settings
2. Check `DATABASE_URL` environment variable exists
3. Ensure database and service are in same region

### Build Failures
1. Check `requirements.txt` is correct
2. Verify Python version compatibility
3. Check for missing system dependencies

## 📚 Additional Resources

- [Render API Documentation](https://render.com/docs/api)
- [Render Blueprint Guide](https://render.com/docs/blueprint-spec)
- [FastAPI Deployment Best Practices](https://render.com/articles/fastapi-production-deployment-best-practices)
- [Render CLI Documentation](https://render.com/docs/cli)

## 🎯 Recommended Approach

**For Production**: Use **Method 1 (Blueprint)** - it's the most automated, version-controlled, and follows Render's best practices.

**For Development**: Use **Method 2 (CLI)** - quick iterations with manual oversight.

**For CI/CD**: Use **Method 3 (API)** - full programmatic control.

