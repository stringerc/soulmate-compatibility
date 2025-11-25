# 🚀 Deploy via Vercel CLI - Step by Step

## Vercel CLI is Installed! ✅

We can trigger deployment directly from command line.

## Option A: If Already Logged In

Run this command:
```bash
cd web_app/frontend
vercel --prod
```

This will:
1. Deploy latest code from current directory
2. Use production environment
3. Complete in 2-3 minutes

---

## Option B: If Not Logged In

### Step 1: Login to Vercel
```bash
vercel login
```
- Opens browser for authentication
- Authorize Vercel CLI

### Step 2: Link Project (First Time)
```bash
cd web_app/frontend
vercel link
```
- Select existing project: `soulmate-compatibility`
- Confirm settings

### Step 3: Deploy
```bash
vercel --prod
```

---

## Option C: Deploy Specific Commit

If you want to deploy from repo root:
```bash
cd /Users/Apple/Documents/soul\ mate
vercel --cwd web_app/frontend --prod
```

---

## What Happens

1. Vercel CLI reads `vercel.json` config
2. Builds the project (`npm run build`)
3. Deploys to production
4. Returns deployment URL

---

## Expected Output

```
Vercel CLI 48.5.0
? Set up and deploy? [Y/n] y
? Which scope? [Your account]
? Link to existing project? [Y/n] y
? What's the name of your project? soulmate-compatibility
...
✅ Production: https://soulmates.syncscript.app [2s]
```

---

## After Deployment

1. ✅ Site updates immediately
2. ✅ Debugging tools appear
3. ✅ Latest code is live

---

**Let's try this now!**

