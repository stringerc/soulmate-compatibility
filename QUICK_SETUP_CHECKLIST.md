# ✅ Quick Setup Checklist

## Current Status

- ✅ Google Client ID: Added to `.env.local`
- ✅ Google Client Secret: Added to `.env.local`
- ✅ NEXTAUTH_SECRET: Configured
- ✅ NEXTAUTH_URL: Set
- ⏳ Redirect URI: Need to add (2 minutes)

---

## 🚀 Fast Setup (2 minutes)

### Step 1: Add Redirect URI (1 minute)

1. **Browser should be open** to Google Cloud Console
2. **Find your OAuth client**:
   - Search for: `345675647175`
   - Or look for client ID ending in: `...o5lhunqoh806o996123uv4p6qlgthrqu.apps.googleusercontent.com`
3. **Click on it** to edit
4. **Scroll to "Authorized redirect URIs"**
5. **Click "+ ADD URI"**
6. **Paste this**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. **Click "SAVE"** (bottom of page)

### Step 2: Restart Dev Server (30 seconds)

```bash
# Stop current server (Ctrl+C if running)
cd apps/soulmates
npm run dev
```

### Step 3: Test (30 seconds)

1. Visit: `http://localhost:3000/login`
2. Click: **"Sign in with Google"**
3. Should redirect to Google login ✅

---

## ✅ Verification

After restarting, test if provider is loaded:

```bash
curl http://localhost:3000/api/auth/providers
```

Should return:
```json
{"google":{"id":"google","name":"Google",...}}
```

---

## 🎉 Done!

Once you've added the redirect URI and restarted the server, Google Sign-In will work!

**Total time:** ~2 minutes

