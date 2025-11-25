# Quick Start Guide

## 🚀 Servers Running!

Your servers should now be starting up:

- **Backend API**: http://localhost:8000
- **Frontend App**: http://localhost:3000

## 📝 Current Status

### ✅ What's Working
- Frontend UI (all pages)
- Backend API server
- Phase system and feature flags
- Authentication scaffolding

### ⚠️ What Needs Setup
- **Database**: PostgreSQL is not running
  - Database features (profiles, bonds, journaling) won't work until DB is set up
  - See "Database Setup" below

## 🧪 Testing Without Database

You can still test:
1. **Frontend UI**: Navigate to http://localhost:3000
2. **Page Structure**: All routes are available
3. **Phase Gating**: Features show/hide based on phase
4. **UI Components**: All pages render correctly

API calls will fail without database, but you can see the UI!

## 🗄️ Database Setup (Optional for Full Testing)

To enable database features:

### Option 1: Install PostgreSQL Locally

```bash
# macOS (using Homebrew)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb soulmate_db

# Update .env
cd web_app/backend
# Edit .env and set:
# DATABASE_URL=postgresql://your_user@localhost:5432/soulmate_db

# Run migrations
python scripts/migrate_soulmates.py
python scripts/init_soulmates_data.py
```

### Option 2: Use SQLite (Simpler, for testing)

Edit `web_app/backend/database/connection.py`:
```python
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./soulmate.db")
```

Then run migrations again.

## 🎯 Testing Flow

1. **Open Frontend**: http://localhost:3000
2. **Home Page**: See all available features
3. **Onboarding**: `/onboarding` - Complete profile (needs DB)
4. **Dashboard**: `/me` - View profile (needs DB)
5. **Journaling**: `/journaling` - Create entries (needs DB)
6. **Explorer**: `/explore` - Test compatibility (needs DB)
7. **Bonds**: `/bonds` - Couple mode (needs DB)
8. **Resonance Lab**: `/lab` - Solo lab (needs DB)

## 🔧 Troubleshooting

### Backend not starting?
```bash
cd web_app/backend
uvicorn app:app --reload --port 8000
```

### Frontend not starting?
```bash
cd apps/soulmates
npm run dev
```

### Port already in use?
- Backend: Change `PORT=8000` in `.env`
- Frontend: Change port in `package.json` scripts

### Check logs
- Backend: Check terminal where uvicorn is running
- Frontend: Check terminal where `npm run dev` is running

## 📚 Next Steps

1. **Set up database** (see above) for full functionality
2. **Test authentication** - Sign in via magic link
3. **Create test data** - Complete onboarding, create bonds
4. **Test all phases** - Change `SOULMATES_PHASE` in `.env` files

## 🎉 You're Ready!

The app is running! Open http://localhost:3000 in your browser to start testing.

