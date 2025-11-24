# Frontend Deployment Guide

## Quick Deploy to Vercel

### 1. One-Click Deploy

1. Go to: https://vercel.com
2. Click "Add New" → "Project"
3. Import GitHub repository: `soulmate-compatibility`
4. Configure:

**Project Settings:**
- **Framework Preset**: Next.js
- **Root Directory**: `web_app/frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### 2. Deploy

Click "Deploy" and wait ~1-2 minutes.

### 3. Add Custom Domain

1. Go to Project Settings → Domains
2. Add: `soulmates.syncscript.app`
3. Update DNS records (if needed)

---

## Local Development

### 1. Install Dependencies

```bash
cd web_app/frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | Backend API URL |

**Note**: `NEXT_PUBLIC_` prefix makes variable available in browser.

---

## Pages & Routes

- `/` - Main user-facing app (Story Quest)
- `/partner` - Partner portal
- `/docs` - API documentation
- `/api-test` - API testing interface

---

## Troubleshooting

### Build Fails

- Check Node.js version (18+)
- Clear `.next` folder: `rm -rf .next`
- Reinstall: `rm -rf node_modules && npm install`

### API Connection Failed

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Verify CORS settings in backend

### Type Errors

- Run: `npm run lint`
- Check TypeScript: `npx tsc --noEmit`

---

## Performance Optimization

- **Image Optimization**: Next.js auto-optimizes images
- **Code Splitting**: Automatic via Next.js
- **Caching**: Vercel handles CDN caching

---

**Ready to deploy! 🚀**

