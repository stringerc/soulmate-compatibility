# Google OAuth Configuration - COMPLETE ✅

## ✅ Credentials Added

Your Google OAuth credentials have been added to `apps/soulmates/.env.local`:

- ✅ **Client ID**: `[REDACTED_CLIENT_ID]`
- ✅ **Client Secret**: `[REDACTED_CLIENT_SECRET]`
- ✅ **NEXTAUTH_SECRET**: Configured
- ✅ **NEXTAUTH_URL**: `http://localhost:3000`

---

## 🚀 Next Steps (REQUIRED)

### Step 1: Add Redirect URI in Google Console

**CRITICAL**: You must add this redirect URI in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Click **Edit**
4. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Click **Save**

**Without this, Google Sign-In will fail with "redirect_uri_mismatch" error.**

---

### Step 2: Restart Dev Server

**IMPORTANT**: Environment variables are only loaded when the server starts.

```bash
# Stop current server (Ctrl+C)
cd apps/soulmates
npm run dev
```

---

### Step 3: Test

1. Visit `http://localhost:3000/login`
2. Click **"Sign in with Google"**
3. Should redirect to Google login page
4. After login, redirects to `/me` dashboard

---

## ✅ Verification

Test if provider is loaded:

```bash
curl http://localhost:3000/api/auth/providers
```

Should return:
```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    "signinUrl": "http://localhost:3000/api/auth/signin/google",
    "callbackUrl": "http://localhost:3000/api/auth/callback/google"
  }
}
```

---

## 🔧 Troubleshooting

### "redirect_uri_mismatch" Error

**Fix**: Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs in Google Console.

### Button does nothing

**Fix**: 
1. ✅ Restart dev server after adding credentials
2. ✅ Check `.env.local` has all 4 variables
3. ✅ Check browser console for errors

### "Provider not found"

**Fix**: 
- Make sure credentials are not empty
- Restart dev server
- Check `NEXTAUTH_URL` matches your dev server URL

---

## 📝 Production Setup

When deploying to production:

1. Add production redirect URI to Google Console:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

2. Update `.env.local` (or production env vars):
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   ```

---

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ⚠️ Never commit credentials to git
- ⚠️ Use different credentials for production
- ⚠️ Rotate secrets periodically

---

**Status**: ✅ Credentials configured - Just need to restart server and add redirect URI!

