# Backend Setup Guide

**FastAPI Backend for Soulmates Application**

---

## Prerequisites

- Python 3.9+ installed
- PostgreSQL database (local or remote)
- pip (Python package manager)

---

## Quick Start

### 1. Install Dependencies

```bash
cd web_app/backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in `web_app/backend/`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/soulmate_db

# JWT Authentication
JWT_SECRET=your-secret-key-change-in-production
JWT_SECRET_KEY=your-secret-key-change-in-production

# Phase Configuration
SOULMATES_PHASE=3

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://soulmates.syncscript.app

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Environment
ENVIRONMENT=development
```

### 3. Set Up Database

#### Option A: Using Existing PostgreSQL

```bash
# Create database
createdb soulmate_db

# Or using psql:
psql -U postgres
CREATE DATABASE soulmate_db;
\q
```

#### Option B: Using Docker

```bash
docker run --name soulmate-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=soulmate_db \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Run Database Migrations

```bash
cd web_app/backend
python scripts/migrate_soulmates.py
```

This will:
- Create all Soulmates tables (11 models)
- Set up relationships
- Create indexes

### 5. Initialize Default Data

```bash
python scripts/init_soulmates_data.py
```

This creates default subscription plans (FREE, PLUS, COUPLE_PREMIUM).

### 6. Start the Server

```bash
# Development (with auto-reload)
uvicorn app:app --reload --port 8000

# Production
uvicorn app:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Local**: `http://localhost:8000`
- **Health Check**: `http://localhost:8000/health`
- **API Docs**: `http://localhost:8000/docs` (Swagger UI)

---

## Verify Installation

### Test Health Endpoint

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "soulmate-b2b-api"
}
```

### Test API Endpoints

```bash
# Get API docs
curl http://localhost:8000/docs

# Test with authentication (requires JWT token)
curl http://localhost:8000/api/v1/soulmates/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Database Connection Error

**Error**: `psycopg2.OperationalError: connection to server at "localhost" (::1), port 5432 failed`

**Solutions**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`
3. Check PostgreSQL is listening on port 5432: `lsof -i :5432`

### Import Errors

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
lsof -ti:8000

# Kill it
kill -9 $(lsof -ti:8000)

# Or use a different port
uvicorn app:app --reload --port 8001
```

---

## API Endpoints

### Soulmates Endpoints

- `GET /api/v1/soulmates/profile` - Get user profile
- `POST /api/v1/soulmates/profile` - Create/update profile
- `GET /api/v1/soulmates/bonds` - List bonds
- `POST /api/v1/soulmates/bonds/invite` - Create bond invite
- `POST /api/v1/soulmates/bonds/accept` - Accept bond invite
- `GET /api/v1/soulmates/bonds/{bond_id}` - Get bond details
- `GET /api/v1/soulmates/bonds/{bond_id}/compatibility` - Get bond compatibility
- `POST /api/v1/soulmates/bonds/end` - End bond
- `GET /api/v1/soulmates/journaling/entries` - List journal entries
- `POST /api/v1/soulmates/journaling/entries` - Create journal entry
- `POST /api/v1/soulmates/compatibility/explore` - Run compatibility explorer
- `GET /api/v1/soulmates/resonance` - Get solo resonance
- `GET /api/v1/soulmates/bonds/{bond_id}/resonance` - Get couple resonance
- `POST /api/v1/soulmates/billing/checkout` - Create Stripe checkout
- `GET /api/v1/soulmates/billing/subscription` - Get subscription
- `POST /api/v1/soulmates/billing/webhook` - Stripe webhook handler

---

## Development Tips

### Auto-reload on File Changes

The `--reload` flag enables auto-reload:
```bash
uvicorn app:app --reload
```

### View API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI.

### Debug Mode

Set in `.env`:
```bash
ENVIRONMENT=development
```

### Database Migrations

After changing models in `database/soulmates_models.py`:
1. Update the model
2. Run migration script: `python scripts/migrate_soulmates.py`
3. Restart server

---

## Production Deployment

### Environment Variables

Set these in your production environment:
- `DATABASE_URL` - Production PostgreSQL URL
- `JWT_SECRET` - Strong random secret
- `ALLOWED_ORIGINS` - Production frontend URL
- `STRIPE_SECRET_KEY` - Production Stripe key
- `STRIPE_WEBHOOK_SECRET` - Production webhook secret
- `ENVIRONMENT=production`

### Recommended Platforms

- **Render**: Easy PostgreSQL + FastAPI deployment
- **Railway**: Simple setup, auto-deploy from GitHub
- **Fly.io**: Global edge deployment
- **Heroku**: Traditional PaaS (if still using)

### Example: Render Deployment

1. Connect GitHub repo
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Add PostgreSQL database
5. Set environment variables
6. Deploy!

---

## Next Steps

1. ✅ Backend is running
2. ✅ Database is set up
3. ✅ Migrations are complete
4. ⏳ Start frontend: `cd apps/soulmates && npm run dev`
5. ⏳ Test full flow end-to-end

---

**Status**: Ready for development and testing

