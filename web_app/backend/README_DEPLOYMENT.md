# Backend Deployment Guide

## Quick Deploy to Render

### 1. One-Click Deploy

1. Go to: https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:

**Basic Settings:**
- **Name**: `soulmate-b2b-api`
- **Root Directory**: `web_app/backend`
- **Environment**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

**Environment Variables:**
```bash
DATABASE_URL=<your_postgresql_url>
ENVIRONMENT=production
ALLOWED_ORIGINS=https://soulmates.syncscript.app
JWT_SECRET_KEY=<generate_random_string>
```

### 2. Create Database

1. In Render dashboard: "New +" → "PostgreSQL"
2. Name: `soulmate-b2b-db`
3. Copy connection string to `DATABASE_URL`

### 3. Initialize Database

After deployment, run:
```bash
# Via Render Shell or locally
python scripts/init_db.py
```

### 4. Test Deployment

```bash
curl https://your-service.onrender.com/health
```

---

## Local Development Setup

### 1. Install Dependencies

```bash
cd web_app/backend
pip install -r requirements.txt
```

### 2. Set Up Database

```bash
# Create database
createdb soulmate_b2b

# Run schema
psql soulmate_b2b < database/schema.sql

# Or use script
bash scripts/setup_db.sh
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### 4. Run Server

```bash
uvicorn app:app --reload --port 8000
```

### 5. Test

```bash
# Health check
curl http://localhost:8000/health

# Test endpoints
bash scripts/test_endpoints.sh
```

---

## Railway Deployment

1. Go to: https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repository
4. Set root directory: `web_app/backend`
5. Add environment variables
6. Deploy!

Railway auto-detects Python and runs the app.

---

## Docker Deployment

### Build Image

```bash
cd web_app/backend
docker build -t soulmate-b2b-api .
```

### Run Container

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET_KEY="..." \
  soulmate-b2b-api
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `ENVIRONMENT` | No | `development` or `production` |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins |
| `JWT_SECRET_KEY` | Yes | Secret for JWT tokens |
| `STRIPE_SECRET_KEY` | No | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook secret |
| `PORT` | Auto | Server port (set by platform) |

---

## Troubleshooting

### Database Connection Failed

- Check `DATABASE_URL` format
- Verify database is running
- Check network/firewall settings

### Import Errors

- Verify all dependencies installed: `pip install -r requirements.txt`
- Check Python version (3.11+)

### Port Already in Use

- Change port: `uvicorn app:app --port 8001`
- Or kill process using port 8000

---

## Monitoring

- **Logs**: Check Render/Railway dashboard
- **Health**: `GET /health` endpoint
- **Metrics**: Platform dashboard

---

**Ready to deploy! 🚀**

