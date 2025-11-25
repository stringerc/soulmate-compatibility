# Auth0 Quick Setup (5 Minutes)

## Why Auth0 is Easier

✅ **No redirect URI configuration** - Auth0 handles it
✅ **Simple dashboard setup** - Just copy/paste credentials
✅ **Better error messages** - Easier to debug
✅ **Free tier available** - No cost for development

---

## Step 1: Create Auth0 Account (2 minutes)

1. Go to: https://auth0.com/signup
2. Sign up (free tier)
3. Choose region (US, EU, etc.)
4. Verify email

---

## Step 2: Create Application (1 minute)

1. In Auth0 Dashboard, go to **Applications**
2. Click **Create Application**
3. Name: `Soulmates App`
4. Type: **Regular Web Application**
5. Click **Create**

---

## Step 3: Configure Application (1 minute)

1. Go to **Settings** tab
2. Copy these values:
   - **Domain**: `your-tenant.auth0.com`
   - **Client ID**: `xxxxx`
   - **Client Secret**: `xxxxx` (click "Show" to reveal)

3. Scroll to **Allowed Callback URLs**:
   ```
   http://localhost:3000/api/auth/callback/auth0
   ```

4. Scroll to **Allowed Logout URLs**:
   ```
   http://localhost:3000
   ```

5. Scroll to **Allowed Web Origins**:
   ```
   http://localhost:3000
   ```

6. Click **Save Changes**

---

## Step 4: Enable Google Social Connection (1 minute)

1. Go to **Authentication** → **Social**
2. Click **Google**
3. Toggle **Enabled** to ON
4. Enter your Google credentials:
   - **Client ID**: `[REDACTED_CLIENT_ID].apps.googleusercontent.com`
   - **Client Secret**: `[REDACTED_CLIENT_SECRET]`
5. Click **Save**

---

## Step 5: Add to .env.local

Add these to `apps/soulmates/.env.local`:

```bash
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_DOMAIN=your-tenant.auth0.com
```

---

## Step 6: Restart Server

```bash
cd apps/soulmates
npm run dev
```

---

## ✅ Done!

Auth0 handles all the OAuth complexity. Just sign in with Google through Auth0!

---

## Benefits

- ✅ No redirect URI configuration needed
- ✅ Auth0 handles all OAuth flows
- ✅ Better error messages
- ✅ Can add more social providers easily
- ✅ User management dashboard

