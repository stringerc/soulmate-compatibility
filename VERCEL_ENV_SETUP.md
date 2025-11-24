# 🚀 Vercel Environment Variables Setup

## Quick Setup Instructions

### Method 1: Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com/dashboard
2. **Select Project**: `soulmate-compatibility`
3. **Settings** → **Environment Variables**
4. **Add Variables** (see below)
5. **Redeploy**

### Method 2: Vercel CLI (Alternative)

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link project
cd web_app/frontend
vercel link

# Add environment variables
vercel env add RESEND_API_KEY production
# Paste: re_iZLn4keZ_PdNvDBdYS9HK1Tu8MMddvaFz

vercel env add RESEND_FROM_EMAIL production
# Paste: noreply@soulmates.syncscript.app

vercel env add NEXT_PUBLIC_APP_URL production
# Paste: https://soulmates.syncscript.app

# Redeploy
vercel --prod
```

---

## Required Environment Variables

| Variable | Value | Environment |
|----------|-------|------------|
| `RESEND_API_KEY` | `re_iZLn4keZ_PdNvDBdYS9HK1Tu8MMddvaFz` | Production, Preview, Development |
| `RESEND_FROM_EMAIL` | `noreply@soulmates.syncscript.app` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://soulmates.syncscript.app` | Production, Preview, Development |

---

## Verification

After adding variables and redeploying:

1. **Check Build Logs**: Should show no email errors
2. **Test Sign In**: Visit site → Click "Sign In" → Enter email
3. **Check Email**: Should receive magic link within seconds
4. **Check Resend Dashboard**: https://resend.com/emails - see sent emails

---

## Troubleshooting

### Variables Not Working?

- ✅ Make sure variables are added to **all environments** (Production, Preview, Development)
- ✅ **Redeploy** after adding variables (they don't apply to existing deployments)
- ✅ Check variable names match exactly (case-sensitive)

### Still Not Working?

- Check Vercel function logs for errors
- Verify Resend API key is valid at https://resend.com/api-keys
- Test locally with `.env.local` file

---

**Last Updated**: December 24, 2024

