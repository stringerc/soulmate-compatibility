# 🔧 Resend API Setup Guide

## Quick Setup (5 minutes)

### Step 1: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/dashboard
   - Select your project: `soulmate-compatibility`

2. **Navigate to Settings**:
   - Click on your project
   - Go to **Settings** → **Environment Variables**

3. **Add Required Variables**:

   **Variable 1: RESEND_API_KEY**
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_iZLn4keZ_PdNvDBdYS9HK1Tu8MMddvaFz`
   - **Environment**: Production, Preview, Development (select all)
   - Click **Save**

   - Click **Save**

   **Variable 2: RESEND_FROM_EMAIL**
   - **Key**: `RESEND_FROM_EMAIL`
   - **Value**: `noreply@soulmates.syncscript.app`
   - **Environment**: Production, Preview, Development (select all)
   - Click **Save**

   **Variable 3: NEXT_PUBLIC_APP_URL**
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://soulmates.syncscript.app`
   - **Environment**: Production, Preview, Development (select all)
   - Click **Save**

4. **Redeploy**:
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger auto-deploy

---

## Step 2: Verify Resend Domain (Optional but Recommended)

For better email deliverability:

1. **Go to Resend Dashboard**:
   - Visit: https://resend.com/domains
   - Click **Add Domain**
   - Enter: `soulmates.syncscript.app`

2. **Add DNS Records**:
   Resend will provide DNS records to add:
   - **SPF Record**: `v=spf1 include:resend.com ~all`
   - **DKIM Record**: (provided by Resend)
   - **DMARC Record**: `v=DMARC1; p=none; rua=mailto:dmarc@soulmates.syncscript.app`

3. **Verify Domain**:
   - Add records to your DNS provider (where syncscript.app is hosted)
   - Wait for verification (usually 5-10 minutes)
   - Once verified, emails will have better deliverability

---

## Step 3: Test Email Delivery

After deployment:

1. **Visit**: https://soulmates.syncscript.app
2. **Click**: "Sign In" button
3. **Enter**: Your email address
4. **Check**: Your inbox (and spam folder)
5. **Click**: Magic link in email
6. **Verify**: You're logged in

---

## Troubleshooting

### Emails Not Arriving?

1. **Check Spam Folder**: Magic links often go to spam initially
2. **Verify API Key**: Check Vercel environment variables are set correctly
3. **Check Resend Dashboard**: https://resend.com/emails - see if emails are being sent
4. **Check Logs**: Vercel function logs will show email sending status

### Build Errors?

- Make sure all environment variables are set
- Check that `NEXT_PUBLIC_APP_URL` matches your domain
- Verify Resend API key is valid (starts with `re_`)

### Still Having Issues?

1. **Check Resend API Status**: https://status.resend.com
2. **Review Vercel Logs**: Deployment logs show detailed errors
3. **Test Locally**: Run `npm run dev` and check console logs

---

## Environment Variables Summary

```bash
# Required for email delivery
RESEND_API_KEY=re_iZLn4keZ_PdNvDBdYS9HK1Tu8MMddvaFz
RESEND_FROM_EMAIL=noreply@soulmates.syncscript.app
NEXT_PUBLIC_APP_URL=https://soulmates.syncscript.app

# Already configured
NEXT_PUBLIC_API_URL=https://soulmate-b2b-api.onrender.com
```

---

## Security Notes

⚠️ **Important**:
- Never commit API keys to Git
- API keys are stored securely in Vercel
- Resend API key has rate limits (100 emails/day free tier)
- Consider upgrading Resend plan for production use

---

**Last Updated**: December 24, 2024
**Status**: Ready to configure ✅

