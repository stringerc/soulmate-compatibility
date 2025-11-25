# Automated Redirect URI Setup

## 🤖 Browser Automation Attempted

I tried to automate adding the redirect URI, but Google Cloud Console requires authentication that needs to be done in your browser session.

## ✅ Quick Manual Steps (2 minutes)

Since you need to be logged in anyway, here's the fastest way:

### Option 1: Direct Link (FASTEST)

1. **Click this link** (opens your OAuth client directly if you're logged in):
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Find your client** (search for: `345675647175`)

3. **Click on it** to edit

4. **Scroll to "Authorized redirect URIs"**

5. **Click "+ ADD URI"**

6. **Paste this**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

7. **Click "SAVE"** (bottom of page)

### Option 2: Use the Helper Script

Run this in your terminal:
```bash
cd "/Users/Apple/Documents/soul mate"
./automate_google_redirect.sh
```

This opens the console and shows instructions.

---

## 🎯 After Adding Redirect URI

1. **Restart your dev server**:
   ```bash
   cd apps/soulmates
   npm run dev
   ```

2. **Test Google Sign-In**:
   - Visit `http://localhost:3000/login`
   - Click "Sign in with Google"
   - Should redirect to Google login ✅

---

## ✅ Verification

After adding the redirect URI, test:

```bash
curl http://localhost:3000/api/auth/providers
```

Should show Google provider is configured.

---

**Status**: Credentials configured ✅ | Just need redirect URI + restart 🚀

