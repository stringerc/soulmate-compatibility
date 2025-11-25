# Soulmates Phased Rollout Guide

## Overview

Soulmates.syncscript.app uses a phased rollout system (Phase 0-3) to gradually release features while maintaining stability and gathering feedback.

## Phase Definitions

### Phase 0: MVP - Solo Self-Discovery
**Goal**: A single user can sign in, complete onboarding, see their profile, and journal.

**Features**:
- `self_profile` - SoulProfile creation and viewing
- `self_dashboard` - Solo dashboard with key dimensions
- `souljourney_journaling` - Journaling entries for self-reflection

**Environment**: Production default

### Phase 1: Compatibility Explorer
**Goal**: Users can test compatibility against archetypal partners or hypothetical profiles.

**Features**:
- All Phase 0 features
- `comp_explorer` - Compatibility calculation and exploration UI

**Environment**: Production after Phase 0 validation

### Phase 2: Couple Mode
**Goal**: Two users can opt-in to a bond and use couple features.

**Features**:
- All Phase 1 features
- `bond_mode_basic` - Bond invites, acceptance, couple dashboard

**Environment**: Staging default, production after validation

### Phase 3: Resonance Lab
**Goal**: Time-series resonance insights and SyncScript integration.

**Features**:
- All Phase 2 features
- `bond_resonance_lab` - Solo and couple resonance lab views

**Environment**: Development default, staging after validation

## Environment Configuration

### Setting Phase

**Environment Variable**:
```bash
SOULMATES_PHASE=0  # or 1, 2, 3
```

**Per-Environment** (via `config/environments.soulmates.json`):
- `development`: Phase 3
- `staging`: Phase 2
- `production`: Phase 1 (default)

### Feature Gating

Features are automatically gated based on phase:

```typescript
import { useSoulmatesFeature } from "@soulmates/config";

function MyComponent() {
  const canUseExplorer = useSoulmatesFeature("comp_explorer");
  
  if (!canUseExplorer) {
    return <div>Coming soon!</div>;
  }
  
  return <CompatibilityExplorer />;
}
```

## Promoting a Phase

### Steps

1. **Test in Development**
   - Set `SOULMATES_PHASE=X` in development
   - Test all features for that phase
   - Fix any issues

2. **Promote to Staging**
   - Update staging environment variable
   - Run integration tests
   - Monitor for errors

3. **Promote to Production**
   - Update production environment variable
   - Monitor metrics and user feedback
   - Be ready to rollback if needed

### Rollback

If issues occur:
1. Revert `SOULMATES_PHASE` to previous value
2. Investigate and fix issues
3. Re-test before re-promoting

## Feature Flags vs Phases

- **Phases**: Broad rollout stages (0-3)
- **Feature Flags**: Fine-grained control (can be added later)

For now, phases are sufficient. Feature flags can be added if needed for A/B testing or gradual rollouts.

## Monitoring

Track these metrics per phase:
- User adoption rate
- Feature usage
- Error rates
- User feedback

Use analytics events (`logSoulmatesEvent`) to track feature usage.

