# Quick Google Sign-In Setup (5 Minutes)

## ✅ Simplest Method: Direct Google OAuth

**Why this is easiest:**
- No Auth0 needed
- Works immediately once credentials are added
- Standard NextAuth.js setup
- Clear error messages

---

## Step 1: Get Google OAuth Credentials (2 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. **Authorized redirect URIs**: Add this exact URL:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **Create**
8. **Copy the Client ID and Client Secret**

---

## Step 2: Add to .env.local (1 minute)

Edit `apps/soulmates/.env.local` and add:

```bash
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
NEXTAUTH_SECRET=lo2JXv8QtOZ0NGRzV38IQ1zplpKBiG9xsmvqBYL5fp0=
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## Step 3: Restart Dev Server (30 seconds)

```bash
# Stop current server (Ctrl+C)
cd apps/soulmates
npm run dev
```

---

## Step 4: Test (30 seconds)

1. Visit `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Should redirect to Google login
4. After login, redirects to `/me` dashboard

---

## ✅ Verification

Test if provider is loaded:
```bash
curl http://localhost:3000/api/auth/providers
```

Should return:
```json
{"google":{"id":"google","name":"Google",...}}
```

---

## 🔧 Troubleshooting

### Button does nothing
- ✅ Check `.env.local` has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- ✅ Restart dev server after adding env vars
- ✅ Check browser console for errors

### "Provider not found"
- ✅ Make sure credentials are not empty strings
- ✅ Check `NEXTAUTH_URL` matches your dev server URL

### Redirect URI mismatch
- ✅ Add `http://localhost:3000/api/auth/callback/google` to Google Console
- ✅ For production, add your production URL too

---

## 📝 Production Setup

For production, add to Google Console:
- **Authorized redirect URI**: `https://yourdomain.com/api/auth/callback/google`
- Update `NEXTAUTH_URL` in production env vars

---

**That's it!** Once credentials are added, Google Sign-In works immediately.

