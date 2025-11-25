# STEP 1: Repository Inspection Report

**Date**: Inspection only - no modifications made  
**Purpose**: Map current repo structure for Soulmates + SyncScript integration plan

---

## 📁 Project Layout

### Monorepo Structure: ✅ EXISTS

```
.
├── apps/
│   └── soulmates/          # ✅ Already created (Next.js 14 App Router)
│       ├── app/            # App Router structure
│       ├── lib/            # API client, utilities
│       └── hooks/          # React hooks
│
├── packages/
│   ├── config-soulmates/   # ✅ Phase system exists
│   ├── core-domain/        # ✅ Shared utilities (Python + TypeScript)
│   └── soulmates-engine/   # ✅ Compatibility engine
│
├── web_app/
│   ├── frontend/           # Existing Next.js app (soulmate compatibility)
│   │   ├── app/            # App Router
│   │   ├── components/     # React components
│   │   └── lib/            # TypeScript utilities
│   │
│   └── backend/            # FastAPI backend
│       ├── database/       # SQLAlchemy models
│       ├── api/            # API routes
│       └── app.py          # Main FastAPI app
│
└── [root Python files]     # Research/compatibility engine
    ├── base_model.py
    ├── analysis.py
    └── data_schema.py
```

### Key Finding: **Hybrid Structure**
- Monorepo exists (`apps/`, `packages/`)
- `apps/soulmates/` already created
- `web_app/` contains existing soulmate compatibility app (NOT syncscript)
- **No `apps/syncscript/` found** - syncscript.app may not exist yet or is separate

---

## 🗄️ Database Schema

### ORM: **SQLAlchemy** (NOT Prisma)

**Location**: `web_app/backend/database/`

**Files**:
- `models.py` - B2B models (Partner, APIKey, etc.)
- `soulmates_models.py` - ✅ Soulmates domain models already exist
- `schema.sql` - Raw SQL schema
- `connection.py` - Database connection

### User Model

**Location**: `web_app/backend/database/soulmates_models.py:70`

```python
class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

**Key**: Uses `UUID` type, not CUID or integer.

### Existing Soulmates Models: ✅ ALREADY CREATED

All models from the plan already exist in `soulmates_models.py`:
- ✅ `SoulProfile`
- ✅ `CompatibilitySnapshot`
- ✅ `RelationshipBond`
- ✅ `BondInvite`
- ✅ `SoulJourneyEntry`
- ✅ `SoulmatesPlan` / `SoulmatesSubscription`
- ✅ `Organization` / `OrganizationMembership` / `OrganizationPlan`
- ✅ `SoulmatesDeepReport`

**Note**: Field `metadata` renamed to `bond_metadata` (SQLAlchemy reserved word conflict).

---

## 🔐 Authentication

### System: **Custom JWT** (NOT NextAuth, NOT Auth0)

**Backend**:
- `web_app/backend/api/auth_jwt.py` - JWT utilities for Partner (B2B)
- `web_app/backend/api/v1/soulmates/auth.py` - ✅ JWT auth for Users (soulmates)

**Frontend**:
- `web_app/frontend/app/api/auth/magic-link/` - Magic link auth
- `web_app/frontend/lib/auth.ts` - Auth utilities

**Pattern**:
- JWT tokens stored in `localStorage` as `auth_token`
- Token verification via `/api/auth/verify` or `/api/auth/me`
- Custom JWT secret: `JWT_SECRET` or `JWT_SECRET_KEY` env var

**Auth Dependency**: `get_current_user_id()` in `api/v1/soulmates/auth.py`

---

## 💳 Payments & Stripe

### Status: ✅ SCAFFOLDING EXISTS

**Backend**:
- `web_app/backend/api/v1/stripe_webhook.py` - B2B Stripe webhook
- `web_app/backend/api/v1/soulmates/stripe_webhook.py` - ✅ Soulmates Stripe webhook
- `packages/core-domain/python/payments.py` - ✅ Payment adapter interface

**Configuration**:
- Env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Payment adapter pattern (abstracted, Stripe-first)

**Status**: Scaffolded but not fully wired (TODOs present)

---

## 📊 Analytics & Events

### Systems Found:

1. **Google Analytics**: `web_app/frontend/lib/googleAnalytics.ts`
2. **Custom Analytics**: `web_app/frontend/lib/analytics.ts`
3. **Soulmates Events**: `packages/core-domain/typescript/events.ts` - ✅ Created

**Pattern**:
- Custom event logging
- Google Analytics integration exists
- PostHog/Mixpanel not yet integrated (TODOs in code)

---

## 🎨 Frontend Stack

### Main Apps:

1. **`apps/soulmates/`** (NEW):
   - Next.js 14 App Router
   - TypeScript
   - Tailwind CSS
   - Phase system integrated

2. **`web_app/frontend/`** (EXISTING):
   - Next.js 14 App Router
   - TypeScript
   - Tailwind CSS
   - Compatibility calculator UI
   - Magic link auth

### Design System:
- Tailwind CSS with custom gradients (pink/purple/indigo)
- Dark mode support
- Lucide React icons
- Recharts for visualizations

---

## 🔧 Backend Stack

### Framework: **FastAPI** (Python)

**Location**: `web_app/backend/`

**Structure**:
- `app.py` - Main FastAPI app
- `api/v1/` - Versioned API routes
- `api/v1/soulmates/` - ✅ Soulmates routes already exist
- `database/` - SQLAlchemy models

**Database**: PostgreSQL (via `DATABASE_URL`)

---

## 📦 Package Management

### Root `package.json`:
```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

**Status**: NPM workspaces configured

**Scripts**:
- `dev:soulmates` - Development server
- `build:soulmates` - Build
- `start:soulmates` - Production start

---

## 🚨 Constraints & Findings

### 1. **No Prisma - Use SQLAlchemy**
- Plan mentions Prisma, but repo uses SQLAlchemy
- Must adapt all schema changes to SQLAlchemy syntax
- Migration scripts use `Base.metadata.create_all()`

### 2. **No SyncScript App Found**
- Plan assumes `apps/syncscript/` exists
- Current structure: `web_app/frontend/` is soulmate compatibility app
- May need to create `apps/syncscript/` or adapt plan

### 3. **Auth is Custom JWT, Not NextAuth**
- Plan mentions NextAuth/Auth0
- Actual: Custom JWT with magic links
- Must use existing auth patterns

### 4. **Soulmates Models Already Exist**
- All domain models from plan already created
- May need to verify/refine, not create from scratch

### 5. **Phase System Already Exists**
- `packages/config-soulmates/phases.ts` already implemented
- Feature flags system in place

---

## 📋 Proposed File Paths for Next Steps

Based on inspection, here's what will be touched:

### STEP 3 (Monorepo Structure):
- ✅ `apps/soulmates/` - Already exists
- ⚠️ May need to create `apps/syncscript/` (if syncscript.app exists separately)
- ✅ `packages/` structure exists

### STEP 4 (Domain Model):
- ⚠️ Models already exist in `web_app/backend/database/soulmates_models.py`
- May need to:
  - Verify model completeness
  - Add any missing fields
  - Create migration script (already exists: `scripts/migrate_soulmates.py`)

### STEP 5 (Feature Flags):
- ✅ Already implemented in `packages/config-soulmates/phases.ts`
- May need minor adjustments

### STEP 6 (Phase 0 Implementation):
- `apps/soulmates/app/onboarding/page.tsx` - ✅ Exists, may need refinement
- `apps/soulmates/app/me/page.tsx` - ✅ Exists, may need refinement
- `apps/soulmates/app/journaling/page.tsx` - ✅ Exists, may need refinement
- Backend API routes - ✅ Exist in `api/v1/soulmates/`

---

## ✅ Summary

### What's Already Done:
1. ✅ Monorepo structure (`apps/`, `packages/`)
2. ✅ `apps/soulmates/` Next.js app created
3. ✅ All Soulmates domain models (SQLAlchemy)
4. ✅ Phase system and feature flags
5. ✅ Backend API routes (profiles, bonds, journaling, etc.)
6. ✅ Auth integration (JWT)
7. ✅ Payment scaffolding
8. ✅ Analytics event system

### What Needs Work:
1. ⚠️ Verify/refine existing models match plan exactly
2. ⚠️ Complete Phase 0 UI implementation (pages exist but may need polish)
3. ⚠️ Wire up actual database (migrations ready)
4. ⚠️ SyncScript integration (if syncscript.app exists)
5. ⚠️ Complete payment integration (scaffolding exists)

### Key Adaptation Needed:
- **Use SQLAlchemy, not Prisma** for all schema work
- **Use existing JWT auth, not NextAuth**
- **Build on existing structure, don't recreate**

---

## 🎯 Next Steps Recommendation

Since much is already implemented, the plan should:
1. **Verify** existing implementation matches requirements
2. **Refine** where needed (UI polish, missing features)
3. **Integrate** with SyncScript (if it exists)
4. **Complete** payment and analytics wiring
5. **Test** end-to-end flows

The foundation is solid - focus on integration and polish rather than greenfield development.

