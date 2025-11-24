# Deployment Guide: Soulmate Compatibility Web App

## Quick Start (Recommended Path)

### Option 1: Privacy-First Client-Side App (Best for MVP)

**Why**: Maximum privacy, no server costs, fastest to deploy.

#### Step 1: Create Frontend

```bash
# Create Next.js app
npx create-next-app@latest soulmate-app --typescript --tailwind --app
cd soulmate-app

# Install dependencies
npm install axios recharts  # For API calls and charts
```

#### Step 2: Port Core Logic to JavaScript

Create `lib/compatibility.ts`:

```typescript
// Simplified compatibility calculator
export interface PersonVector {
  traits: number[]; // 32D
}

export interface ResonanceVector {
  metrics: number[]; // 7D
}

export function traitDistance(p1: PersonVector, p2: PersonVector): number {
  let sum = 0;
  for (let i = 0; i < 32; i++) {
    sum += Math.pow(p1.traits[i] - p2.traits[i], 2);
  }
  return Math.sqrt(sum);
}

export function traitCompatibility(p1: PersonVector, p2: PersonVector): number {
  return Math.exp(-traitDistance(p1, p2));
}

export function resonanceCompatibility(r: ResonanceVector): number {
  const mean = r.metrics.reduce((a, b) => a + b, 0) / 7;
  const variance = r.metrics.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 7;
  const stability = Math.max(0, Math.min(1, 1 - variance));
  return 0.5 * mean + 0.5 * stability;
}

export function calculateCompatibility(
  p1: PersonVector,
  p2: PersonVector,
  r: ResonanceVector
): {
  c_traits: number;
  c_res: number;
  c_total: number;
  s_hat: number;
} {
  const c_traits = traitCompatibility(p1, p2);
  const c_res = resonanceCompatibility(r);
  const c_total = 0.6 * c_traits + 0.4 * c_res;
  
  return {
    c_traits,
    c_res,
    c_total,
    s_hat: c_total, // Simplified
  };
}
```

#### Step 3: Create Questionnaire Component

Create `components/Questionnaire.tsx`:

```typescript
'use client';

import { useState } from 'react';

const QUESTIONS = [
  { category: 'Attachment', questions: [
    'I feel secure in close relationships',
    'I worry about being abandoned',
    // ... 32 total questions
  ]},
  // ... other categories
];

export default function Questionnaire({ onComplete }: { onComplete: (traits: number[]) => void }) {
  const [responses, setResponses] = useState<number[]>(new Array(32).fill(0.5));
  
  const handleSubmit = () => {
    onComplete(responses);
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Compatibility Questionnaire</h1>
      {/* Render questions */}
      <button onClick={handleSubmit} className="btn-primary">
        Calculate Compatibility
      </button>
    </div>
  );
}
```

#### Step 4: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Done!** Your app is live at `your-app.vercel.app`

---

### Option 2: Full-Stack with Backend API

**Why**: Can collect research data, more flexible.

#### Step 1: Deploy Backend (Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Step 2: Deploy Frontend (Vercel)

```bash
# Set API URL in environment
echo "NEXT_PUBLIC_API_URL=https://your-api.railway.app" > .env.local

# Deploy
vercel
```

---

## Recommended Architecture

### MVP (Week 1)

```
┌─────────────────┐
│   Next.js App   │  (Vercel - Free)
│                 │
│  - Questionnaire│
│  - Calculator   │
│  - Results      │
└─────────────────┘
```

**Features**:
- ✅ 32-question questionnaire
- ✅ Client-side compatibility calculation
- ✅ Results visualization
- ✅ Share via URL (encrypted)

**Cost**: $0/month

---

### Enhanced (Week 2-3)

```
┌─────────────────┐      ┌──────────────┐
│   Next.js App   │──────▶│  FastAPI     │
│                 │       │  (Railway)   │
│  - Questionnaire│       │              │
│  - Calculator   │       │  - API       │
│  - Results      │       │  - Database  │
│  - Sharing      │       │  - Analytics │
└─────────────────┘      └──────────────┘
```

**Features**:
- ✅ All MVP features
- ✅ Optional data collection (anonymized)
- ✅ User accounts (optional)
- ✅ Historical tracking

**Cost**: $5-20/month

---

## Implementation Checklist

### Phase 1: MVP (Privacy-First)
- [ ] Create Next.js app
- [ ] Port compatibility logic to TypeScript
- [ ] Build 32-question questionnaire
- [ ] Create results visualization
- [ ] Add share functionality (encrypted URLs)
- [ ] Deploy to Vercel
- [ ] Test with friends/family

### Phase 2: Enhanced
- [ ] Add FastAPI backend
- [ ] Deploy backend to Railway
- [ ] Add optional data collection
- [ ] Create admin dashboard
- [ ] Add analytics

### Phase 3: Research Features
- [ ] User accounts (optional)
- [ ] Historical comparisons
- [ ] A/B testing framework
- [ ] Export data functionality

---

## Key Files to Create

1. **Frontend** (`web_app/frontend/`):
   - `components/Questionnaire.tsx` - Input form
   - `components/Results.tsx` - Results display
   - `lib/compatibility.ts` - Core logic (JS port)
   - `pages/index.tsx` - Main page

2. **Backend** (optional):
   - `web_api.py` - FastAPI endpoints
   - `requirements_web.txt` - Python dependencies

3. **Deployment**:
   - `vercel.json` - Vercel config
   - `railway.json` - Railway config (if using backend)

---

## Privacy Considerations

### Client-Side Only (Recommended)
- ✅ Data never leaves browser
- ✅ No server storage needed
- ✅ GDPR compliant by design
- ✅ Maximum user trust

### With Backend (Optional)
- ⚠️ Need GDPR compliance
- ⚠️ Data encryption required
- ⚠️ User consent for data collection
- ⚠️ Right to delete data

---

## Cost Breakdown

### Free Tier (MVP)
- Vercel: Free (hobby plan)
- **Total**: $0/month

### Production (1000 users/month)
- Vercel Pro: $20/month
- Railway: $20/month
- Database: $5/month
- **Total**: ~$45/month

---

## Next Steps

1. **Choose approach**: Client-side (recommended) or full-stack?
2. **Build MVP**: Start with Next.js + TypeScript
3. **Deploy**: Use Vercel (easiest)
4. **Test**: Get 10-20 people to try it
5. **Iterate**: Based on feedback
6. **Add backend**: Only if you need data collection

---

## Quick Commands

```bash
# Create frontend
npx create-next-app@latest soulmate-app --typescript --tailwind
cd soulmate-app

# Add dependencies
npm install axios recharts

# Run locally
npm run dev

# Deploy
vercel
```

**Your app will be live in ~10 minutes!**

