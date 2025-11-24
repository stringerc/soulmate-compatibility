# Strategic Deployment Plan: Soulmate Compatibility Web Application

## Executive Summary

**Recommended Approach**: Build a **Flask/FastAPI web app** with **client-side computation** for privacy, deployable on **Vercel/Railway/Render** for zero-ops deployment.

**Timeline**: 2-3 days to MVP, 1 week to polished version

**Cost**: Free tier → $5-20/month for production

---

## Architecture Recommendation

### Option 1: **Privacy-First Client-Side App** (RECOMMENDED)

**Why**: Relationship data is highly sensitive. Users trust apps that don't send their data to servers.

**Stack**:
- **Frontend**: React/Vue + TypeScript (or vanilla JS for simplicity)
- **Backend**: Minimal API (FastAPI) for:
  - Optional data collection (anonymized, opt-in)
  - Sharing results via unique URLs
  - Analytics (aggregate only)
- **Deployment**: Vercel (frontend) + Railway/Render (API)
- **Computation**: Client-side (browser runs Python via Pyodide or JS port)

**Pros**:
- ✅ Maximum privacy (data never leaves browser)
- ✅ No server costs for computation
- ✅ Fast user experience
- ✅ GDPR/privacy compliant by design

**Cons**:
- ⚠️ Limited data collection (unless opt-in)
- ⚠️ Requires porting Python to JS or using Pyodide

---

### Option 2: **Server-Side API** (Alternative)

**Stack**:
- **Frontend**: React/Next.js
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL (for storing pairs/results)
- **Deployment**: Railway/Render/Fly.io

**Pros**:
- ✅ Can collect research data
- ✅ Easier to iterate on models
- ✅ Can add ML improvements

**Cons**:
- ⚠️ Privacy concerns (data on server)
- ⚠️ Server costs scale with usage
- ⚠️ Need GDPR compliance, data security

---

## Recommended Implementation: Hybrid Approach

### Phase 1: MVP (Privacy-First)

**Architecture**:
```
User Browser
  ↓
React/Vue Frontend
  ↓ (runs locally)
Pyodide (Python in browser)
  ↓
Compatibility Calculation
  ↓
Results Display
```

**Features**:
1. **Questionnaire**: Collect 32D traits via interactive forms
2. **Pair Input**: Two people's data
3. **Calculation**: Runs entirely in browser
4. **Results**: Visual compatibility breakdown
5. **Share**: Optional unique URL (encrypted, expires)

**Tech Stack**:
- Frontend: **Next.js** (React) or **SvelteKit** (simpler)
- Python Runtime: **Pyodide** (runs Python in browser)
- Styling: **Tailwind CSS**
- Deployment: **Vercel** (free tier)

---

### Phase 2: Enhanced (Optional Data Collection)

Add backend API for:
- Anonymous research data (opt-in)
- User accounts (optional)
- Historical comparisons
- A/B testing different models

---

## Implementation Plan

### Step 1: Create Web API Wrapper

**File**: `web_api.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json

from base_model import PersonVector32, ResonanceVector7, CompatibilityModel
from data_schema import Person, Pair
from analysis import FeatureExtractor, ModelComparator

app = FastAPI(title="Soulmate Compatibility API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PersonInput(BaseModel):
    traits: List[float]  # 32D vector
    birthdate: Optional[str] = None
    name: Optional[str] = None

class PairInput(BaseModel):
    person1: PersonInput
    person2: PersonInput
    resonance: Optional[List[float]] = None  # 7D, optional

class CompatibilityResult(BaseModel):
    c_traits: float
    c_res: float
    c_total: float
    s_hat: float
    soulmate_tier: bool  # Top 10%?
    breakdown: dict

@app.post("/api/compatibility", response_model=CompatibilityResult)
async def calculate_compatibility(pair: PairInput):
    """Calculate compatibility for a pair"""
    try:
        # Create person vectors
        p1 = PersonVector32(traits=pair.person1.traits)
        p2 = PersonVector32(traits=pair.person2.traits)
        
        # Create resonance (or use defaults)
        if pair.resonance:
            r = ResonanceVector7(metrics=pair.resonance)
        else:
            r = ResonanceVector7(metrics=[0.5] * 7)  # Default
        
        # Calculate compatibility
        model = CompatibilityModel()
        result = model.total_compatibility(p1, p2, r)
        
        # Determine soulmate tier (top 10%)
        # This would need calibration based on your data distribution
        
        return CompatibilityResult(
            c_traits=result["C_traits"],
            c_res=result["C_res"],
            c_total=result["C_total"],
            s_hat=result["S_hat"],
            soulmate_tier=False,  # Would need percentile calculation
            breakdown={
                "trait_compatibility": result["C_traits"],
                "resonance_compatibility": result["C_res"],
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/health")
async def health():
    return {"status_code=200, detail="OK"}
```

---

### Step 2: Frontend Application

**Structure**:
```
web_app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Questionnaire.tsx
│   │   │   ├── CompatibilityResults.tsx
│   │   │   └── PairInput.tsx
│   │   ├── lib/
│   │   │   └── compatibility.ts  # JS port of core logic
│   │   └── pages/
│   │       └── index.tsx
│   └── package.json
└── backend/
    └── web_api.py
```

---

### Step 3: Questionnaire Design

**Key Challenge**: Collecting 32D trait vectors from users.

**Solution**: Create a **shortened questionnaire** that maps to 32D:

1. **Attachment & Regulation (5 questions)**
   - "I feel secure in close relationships" → A1
   - "I worry about being abandoned" → A2
   - etc.

2. **Conflict & Communication (5 questions)**
3. **Cognitive Style (5 questions)**
4. **Values (6 questions)**
5. **Social Style (5 questions)**
6. **Sexual System (3 questions)**
7. **Life Structure (3 questions)**

**Total**: ~32 questions (can be shortened with factor analysis)

**Alternative**: Use existing validated scales:
- Big Five → map to S1, S3, A3, L1, T5
- Attachment Style → map to A1-A5
- etc.

---

## Deployment Options

### Option A: Vercel (Frontend) + Railway (Backend)

**Pros**:
- ✅ Free tier for both
- ✅ Auto-deploy from GitHub
- ✅ Easy scaling
- ✅ Good performance

**Steps**:
1. Deploy FastAPI to Railway
2. Deploy Next.js to Vercel
3. Connect via environment variables

---

### Option B: Render (Full-Stack)

**Pros**:
- ✅ Single platform
- ✅ Free tier
- ✅ PostgreSQL included

**Steps**:
1. Create Render account
2. Deploy FastAPI service
3. Deploy static frontend
4. Connect via internal URLs

---

### Option C: Fly.io (Docker)

**Pros**:
- ✅ Docker-based (consistent)
- ✅ Global edge deployment
- ✅ Good for Python apps

**Steps**:
1. Create Dockerfile
2. Deploy to Fly.io
3. Configure domains

---

## Recommended Tech Stack (Final)

### MVP Stack
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Deployment**: Vercel (frontend) + Railway (backend)
- **Database**: None initially (add PostgreSQL later if needed)

### Enhanced Stack (Phase 2)
- **Database**: PostgreSQL (Railway/Render)
- **Auth**: NextAuth.js (optional user accounts)
- **Analytics**: PostHog (privacy-friendly)
- **Storage**: S3/R2 (for research data, encrypted)

---

## Implementation Priority

### Week 1: Core MVP
1. ✅ Create FastAPI wrapper
2. ✅ Build simple questionnaire (32 questions)
3. ✅ Create compatibility calculator page
4. ✅ Deploy to Railway + Vercel

### Week 2: Polish
1. ✅ Better UI/UX
2. ✅ Results visualization (charts, breakdowns)
3. ✅ Share functionality
4. ✅ Mobile responsive

### Week 3: Research Features
1. ✅ Optional data collection (anonymized)
2. ✅ User accounts (optional)
3. ✅ Historical tracking
4. ✅ A/B testing framework

---

## Privacy & Ethics Considerations

### Data Collection
- **Default**: No data stored (client-side only)
- **Opt-in**: Anonymous research data (no PII)
- **GDPR**: Clear consent, right to delete
- **Encryption**: All stored data encrypted

### User Trust
- **Transparency**: Show exactly what's calculated
- **Open Source**: Make code available (builds trust)
- **No Tracking**: No ads, no third-party trackers
- **Clear Terms**: Explain what data is/isn't stored

---

## Cost Estimate

### Free Tier (MVP)
- Vercel: Free (hobby)
- Railway: $5/month (or free trial)
- **Total**: $0-5/month

### Production (1000 users/month)
- Vercel Pro: $20/month
- Railway: $20/month
- Database: $5/month
- **Total**: ~$45/month

---

## Next Steps

1. **Choose approach**: Privacy-first (client-side) or server-side?
2. **Build API wrapper**: Start with `web_api.py`
3. **Create questionnaire**: Map questions to 32D traits
4. **Build frontend**: Simple React/Next.js app
5. **Deploy**: Start with free tiers
6. **Test**: Get friends/family to try it
7. **Iterate**: Based on feedback

---

## Quick Start Commands

```bash
# Create web app structure
mkdir -p web_app/{frontend,backend}
cd web_app

# Backend (FastAPI)
cd backend
pip install fastapi uvicorn python-multipart
# Create web_api.py (see above)

# Frontend (Next.js)
cd ../frontend
npx create-next-app@latest . --typescript --tailwind
# Add compatibility calculation components

# Deploy
# Railway: railway up
# Vercel: vercel deploy
```

---

## Recommendation Summary

**Best Approach**: **Privacy-first client-side app** with optional backend for sharing/research.

**Why**:
1. Builds user trust (data stays local)
2. Lower costs (no computation servers)
3. Faster MVP (simpler architecture)
4. Can add backend later if needed

**Start Simple**: 
- Week 1: Basic questionnaire + compatibility calculator
- Week 2: Polish UI + add sharing
- Week 3: Optional backend for research data

This gives you a working app quickly while maintaining flexibility to add features later.

