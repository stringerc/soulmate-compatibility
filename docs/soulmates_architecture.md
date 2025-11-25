# Soulmates Architecture Documentation

## Current Repository Structure

### Existing Stack
- **Backend**: FastAPI (Python) with SQLAlchemy ORM
- **Frontend**: Next.js 14 (TypeScript) with App Router
- **Database**: PostgreSQL
- **Auth**: JWT-based with magic link authentication
- **Location**: `web_app/backend` and `web_app/frontend`

### Current Models (B2B Focus)
- `Partner` - B2B clients
- `APIKey` - API authentication
- `APIUsage` - Usage tracking
- `Event` / `EventMatch` - Event sponsorship
- `PartnerSubscription` - B2B billing

## Target Architecture

### Monorepo Structure
```
.
├── apps/
│   ├── soulmates/          # Next.js frontend (moved from web_app/frontend)
│   └── syncscript/         # Future: SyncScript app
├── packages/
│   ├── core-domain/        # Shared domain types (Python + TypeScript)
│   ├── soulmates-engine/   # Compatibility calculation engine (Python)
│   └── config-soulmates/   # Phase + feature flags (TypeScript)
└── web_app/
    └── backend/            # FastAPI backend (shared by both apps)
```

### Key Design Decisions

1. **Database**: SQLAlchemy (not Prisma) - adapts to existing Python backend
2. **Auth**: Extend existing JWT/magic link system, add Auth0 scaffolding
3. **Monorepo**: Hybrid approach - Python packages + TypeScript packages
4. **Phased Rollout**: Environment-based phase config (0-3)
5. **Boundaries**: Soulmates is fully usable solo; SyncScript integration via thin API

## Domain Models (Soulmates Layer)

### Core Models
- `SoulProfile` - One per user (archetype, attachment style, values vector)
- `CompatibilitySnapshot` - Compatibility calculations between pairs
- `RelationshipBond` - Links two users for couple mode
- `BondInvite` - Invitation system
- `SoulJourneyEntry` - Journaling entries
- `SoulmatesPlan` / `SoulmatesSubscription` - B2C monetization
- `Organization` / `OrganizationMembership` - B2B scaffolding

### Invariants
- Ending a bond does NOT delete users, profiles, or history
- Users can have multiple historical bonds
- Solo mode always available regardless of bond status

## Phased Rollout

### Phase 0: Solo Self-Discovery MVP
- SoulProfile onboarding
- Solo dashboard
- SoulJourney journaling
- Weekly reflection prompts

### Phase 1: Compatibility Explorer
- Test compatibility against archetypal partners
- Show scores, axis breakdown, explanations

### Phase 2: Couple Mode
- Bond invites (email or user ID)
- Couple dashboard
- Shared prompts and journaling

### Phase 3: Resonance Lab
- Time-series resonance insights
- Solo and couple lab views
- SyncScript integration (aggregated metrics only)

## Integration Points

### SyncScript Integration
- Thin API: `getResonanceSummaryForUser(userId, window)`
- Returns aggregated metrics only (no raw tasks)
- Used by Resonance Lab in Phase 3

### Auth Integration
- Extend existing JWT/magic link
- Optional Auth0 scaffolding (config-driven)
- `getCurrentUser()` helper bridges auth solutions

### Payments
- Stripe-first, abstracted adapter pattern
- Checkout sessions and webhooks
- Plan gating for features

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing secret
- `SOULMATES_PHASE` - Current phase (0-3)

### Optional
- `STRIPE_SECRET_KEY` - Payment processing
- `STRIPE_WEBHOOK_SECRET` - Webhook verification
- `AUTH0_*` - Auth0 integration (if enabled)
- `POSTHOG_KEY` / `MIXPANEL_TOKEN` - Analytics

## Next Steps

1. Create monorepo structure
2. Migrate frontend to `apps/soulmates`
3. Create SQLAlchemy models for soulmates domain
4. Implement phase system
5. Build Phase 0 features
6. Add payments and B2B scaffolding

