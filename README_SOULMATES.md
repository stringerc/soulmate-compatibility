# Soulmates.syncscript.app Implementation

Production-grade soulmates surface with phased rollout, monetization, and B2B scaffolding.

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL database
- Environment variables (see `.env.example`)

### Setup

1. **Install dependencies**:
   ```bash
   # Backend
   cd web_app/backend
   pip install -r requirements.txt
   
   # Frontend
   cd apps/soulmates
   npm install
   ```

2. **Set up database**:
   ```bash
   cd web_app/backend
   python scripts/migrate_soulmates.py
   ```

3. **Configure environment**:
   ```bash
   # Backend (.env)
   DATABASE_URL=postgresql://user:pass@localhost:5432/soulmate_db
   JWT_SECRET=your-secret
   SOULMATES_PHASE=0  # or 1, 2, 3
   
   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:8000
   SOULMATES_PHASE=0
   ```

4. **Run development servers**:
   ```bash
   # Backend (terminal 1)
   cd web_app/backend
   uvicorn app:app --reload
   
   # Frontend (terminal 2)
   cd apps/soulmates
   npm run dev
   ```

## Architecture

See `docs/soulmates_architecture.md` for detailed architecture documentation.

### Key Components

- **Backend**: FastAPI with SQLAlchemy (`web_app/backend`)
- **Frontend**: Next.js 14 App Router (`apps/soulmates`)
- **Shared Packages**:
  - `packages/config-soulmates` - Phase system
  - `packages/core-domain` - Shared types and utilities
  - `packages/soulmates-engine` - Compatibility calculation

## Phased Rollout

See `docs/soulmates_phases.md` for phase definitions and promotion guide.

### Current Phase

Set via `SOULMATES_PHASE` environment variable:
- `0` - MVP (Solo self-discovery)
- `1` - Compatibility Explorer
- `2` - Couple Mode
- `3` - Resonance Lab

## Features

### Phase 0 (MVP)
- ✅ SoulProfile onboarding
- ✅ Solo dashboard
- ✅ SoulJourney journaling

### Phase 1
- ✅ Compatibility explorer API
- ⏳ Compatibility explorer UI (TODO)

### Phase 2
- ✅ Bond invites and acceptance API
- ⏳ Couple dashboard UI (TODO)

### Phase 3
- ✅ Resonance Lab API scaffolding
- ⏳ Resonance Lab UI (TODO)

## Monetization

### B2C Plans

- **FREE**: Basic features, limited compatibility runs
- **PLUS**: Unlimited compatibility, advanced insights
- **COUPLE_PREMIUM**: Couple features, resonance lab

### B2B Scaffolding

- Organizations and memberships
- Org-level subscriptions
- Seat-based licensing

See `web_app/backend/api/v1/soulmates/billing.py` for implementation.

## Payments

Stripe-first payment adapter (abstracted for future swaps).

**Setup**:
1. Set `STRIPE_SECRET_KEY` in backend `.env`
2. Set `STRIPE_WEBHOOK_SECRET` for webhook verification
3. Configure webhook endpoint: `/api/v1/soulmates/billing/webhook`

## Database

### Models

- `SoulProfile` - User soul profiles
- `CompatibilitySnapshot` - Compatibility calculations
- `RelationshipBond` - Couple mode bonds
- `BondInvite` - Bond invitations
- `SoulJourneyEntry` - Journaling entries
- `SoulmatesPlan` / `SoulmatesSubscription` - B2C monetization
- `Organization` / `OrganizationMembership` - B2B scaffolding

### Migrations

Run migrations:
```bash
cd web_app/backend
python scripts/migrate_soulmates.py
```

## API Routes

### Soulmates API (`/api/v1/soulmates`)

- `GET /profile` - Get soul profile
- `POST /profile` - Create/update profile
- `POST /bonds/invite` - Create bond invite
- `POST /bonds/accept` - Accept bond invite
- `POST /bonds/end` - End bond
- `GET /bonds/{bond_id}` - Get bond details
- `POST /journaling/entries` - Create journal entry
- `GET /journaling/entries` - List journal entries
- `POST /compatibility/explore` - Run compatibility explorer
- `POST /billing/checkout` - Create checkout session
- `POST /billing/webhook` - Stripe webhook handler
- `POST /orgs` - Create organization
- `POST /orgs/{org_id}/invite` - Invite member

## Development

### Adding Features

1. Check phase requirements in `packages/config-soulmates/phases.ts`
2. Add feature flag check: `useSoulmatesFeature("feature_name")`
3. Implement backend API route
4. Implement frontend UI
5. Test in development (Phase 3)
6. Promote to staging (Phase 2)
7. Promote to production (Phase 1)

### Testing

```bash
# Backend tests (TODO: add actual tests)
cd web_app/backend
pytest

# Frontend tests
cd apps/soulmates
npm test
```

## Deployment

### CI/CD

GitHub Actions workflow (`.github/workflows/soulmates-deploy.yml`):
- Runs on push to `main` or tags `soulmates-phase-*`
- Tests backend and frontend
- Builds Next.js app
- TODO: Wire actual deployment targets

### Environment Variables

See `.env.example` files in:
- `web_app/backend/.env.example`
- `apps/soulmates/.env.example`

## Next Steps

1. **Complete Phase 0 UI**: Polish onboarding and dashboard
2. **Implement Phase 1 UI**: Compatibility explorer interface
3. **Implement Phase 2 UI**: Couple dashboard and bond management
4. **Implement Phase 3 UI**: Resonance Lab views
5. **Add Auth Integration**: Wire JWT/Auth0 properly
6. **Add Analytics**: Connect PostHog/Mixpanel
7. **Add Tests**: Unit and integration tests
8. **Deploy**: Configure Vercel (frontend) and Render/Railway (backend)

## License

MIT

