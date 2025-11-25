# Fixing `error=google` in NextAuth

## 🔴 Error You're Seeing

```
http://localhost:3000/login?callbackUrl=...&error=google
```

This means Google OAuth failed during the callback.

---

## ✅ Most Common Fix: Redirect URI Mismatch

**The redirect URI in Google Console must EXACTLY match:**
```
http://localhost:3000/api/auth/callback/google
```

### Steps to Fix:

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials

2. **Find your OAuth client:**
   - Client ID: `[REDACTED_CLIENT_ID]`
   - Search for: `739263757591`

3. **Click to edit**

4. **Check "Authorized redirect URIs" section**

5. **Make sure this EXACT URI is listed:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   - Must be `http://` (not `https://`)
   - Must include `/api/auth/callback/google`
   - No trailing slash

6. **If not there, click "+ ADD URI" and add it**

7. **Click "SAVE"**

---

## ✅ Fix 2: Restart Dev Server

**CRITICAL**: After updating credentials or Google Console, restart your dev server:

```bash
# Stop server (Ctrl+C)
cd apps/soulmates
npm run dev
```

Environment variables are only loaded when the server starts!

---

## ✅ Fix 3: Verify Credentials Match

Check that your `.env.local` matches Google Console:

```bash
cd apps/soulmates
cat .env.local | grep GOOGLE
```

Should show:
```
GOOGLE_CLIENT_ID=[REDACTED_CLIENT_ID].apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=[REDACTED_CLIENT_SECRET]
```

---

## ✅ Fix 4: Check NEXTAUTH_URL

Make sure `.env.local` has:
```
NEXTAUTH_URL=http://localhost:3000
```

---

## 🧪 Test After Fixing

1. **Restart dev server**
2. **Visit:** `http://localhost:3000/login`
3. **Click:** "Sign in with Google"
4. **Should redirect to Google login** (not error page)

---

## 🔍 Debug Steps

If still not working:

1. **Check server logs** when clicking sign-in
2. **Check browser console** (F12) for errors
3. **Verify redirect URI** in Google Console matches exactly
4. **Test provider endpoint:**
   ```bash
   curl http://localhost:3000/api/auth/providers
   ```
   Should show Google provider

---

## ✅ Quick Checklist

- [ ] Redirect URI added in Google Console: `http://localhost:3000/api/auth/callback/google`
- [ ] Credentials match in `.env.local` and Google Console
- [ ] `NEXTAUTH_URL=http://localhost:3000` in `.env.local`
- [ ] Dev server restarted after changes
- [ ] No typos in redirect URI (exact match required)

---

**Most likely issue:** Redirect URI not added or doesn't match exactly!
