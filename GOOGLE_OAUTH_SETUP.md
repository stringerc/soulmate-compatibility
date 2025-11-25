# Google OAuth Setup Guide

**Quick Setup**: Since you've set up Google OAuth before, you can reuse your existing credentials or create new ones.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Google OAuth Credentials

**Option A: Reuse Existing Credentials**
- If you have Google OAuth credentials from another project, you can reuse them
- Just add the redirect URI: `http://localhost:3000/api/auth/callback/google`

**Option B: Create New Credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret**

### Step 2: Add to .env.local

Edit `apps/soulmates/.env.local` and add:

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=lo2JXv8QtOZ0NGRzV38IQ1zplpKBiG9xsmvqBYL5fp0=
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Restart Dev Server

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
cd apps/soulmates
npm run dev
```

### Step 4: Test

1. Visit `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Should redirect to Google login
4. After login, redirects to `/me` dashboard

---

## 🔧 Troubleshooting

### "Sign in with Google" button doesn't work

**Check:**
1. ✅ `GOOGLE_CLIENT_ID` is set in `.env.local`
2. ✅ `GOOGLE_CLIENT_SECRET` is set in `.env.local`
3. ✅ `NEXTAUTH_SECRET` is set
4. ✅ `NEXTAUTH_URL` matches your dev server URL
5. ✅ Dev server restarted after adding env vars

### Redirect URI mismatch

**Error**: "redirect_uri_mismatch"

**Fix**: Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs in Google Cloud Console

### Provider not found

**Error**: "OAuthAccountNotLinked" or provider not found

**Fix**: Make sure Google provider is enabled in NextAuth config (it is by default)

---

## ✅ Verification

Test the setup:

```bash
# Check if providers are loaded
curl http://localhost:3000/api/auth/providers

# Should return:
# {"google":{"id":"google","name":"Google",...}}
```

---

## 📝 Notes

- **Development**: Use `http://localhost:3000` for redirect URI
- **Production**: Add your production URL (e.g., `https://soulmates.syncscript.app/api/auth/callback/google`)
- **Security**: Never commit `.env.local` to git (it's already in `.gitignore`)

---

**Status**: Ready to configure - just add credentials to `.env.local`

