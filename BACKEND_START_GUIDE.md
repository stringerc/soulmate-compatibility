# Backend Server Start Guide

**Issue**: Backend process exists but not responding (503 errors)

---

## 🚀 Quick Start

### Option 1: Start Backend Manually

```bash
# Navigate to backend directory
cd web_app/backend

# Start the FastAPI server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Check if Backend is Running

```bash
# Check if port 8000 is in use
lsof -i:8000

# Check if backend responds
curl http://localhost:8000/health
```

---

## 🔧 Troubleshooting

### Backend Not Responding

If you see 503 errors but the backend process exists:

1. **Kill existing processes**:
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```

2. **Restart backend**:
   ```bash
   cd web_app/backend
   uvicorn app:app --reload
   ```

3. **Check backend logs** for errors

### Backend Not Starting

If the backend won't start:

1. **Check Python version**:
   ```bash
   python3 --version  # Should be 3.9+
   ```

2. **Install dependencies**:
   ```bash
   cd web_app/backend
   pip install -r requirements.txt
   ```

3. **Check for database connection** (if using PostgreSQL):
   ```bash
   # Make sure PostgreSQL is running
   # Or update .env to skip database if not needed
   ```

---

## ✅ Verification

Once backend is running, test it:

```bash
# Health check
curl http://localhost:8000/health

# Test compatibility endpoint (will need auth token)
curl -X POST http://localhost:8000/api/v1/soulmates/compatibility/explore \
  -H "Content-Type: application/json" \
  -d '{"hypothetical_profile":{"traits":[0.5]*32,"name":"Test"}}'
```

---

## 📝 Notes

- **Frontend works without backend**: The frontend has fallbacks, so pages load even if backend is down
- **Compatibility explorer needs backend**: This feature requires the backend to be running
- **Other features**: Most features work with fallback data when backend is unavailable

---

**Status**: Backend needs to be restarted to fix 503 errors

