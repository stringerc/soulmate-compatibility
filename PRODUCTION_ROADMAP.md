# Production Roadmap: From 85% to 100% Functional Website

**Based on**: Comprehensive System Analysis  
**Goal**: Transform current implementation into fully functional, monetizable website  
**Timeline**: 2-3 weeks to production-ready

---

## 🎯 CRITICAL GAP IDENTIFIED

**The Problem**: Stripe is fully integrated, plans exist in database, but **users can't see or purchase plans**.

**Impact**: 
- ❌ Zero revenue potential (despite full backend)
- ❌ Users hit limits with no upgrade path
- ❌ No way to convert free users to paid
- ❌ Landing page doesn't communicate value

**Solution**: Implement pricing UI, upgrade prompts, and auth flow.

---

## 📋 IMPLEMENTATION CHECKLIST

### ✅ Week 1: Monetization & Auth (CRITICAL)

#### Day 1-2: Pricing Infrastructure
- [ ] Add `getPlans()` to billing API client
- [ ] Create `/pricing` page
- [ ] Create `<PricingCard />` component
- [ ] Create `<PlanComparison />` component
- [ ] Wire up Stripe checkout
- [ ] Test checkout flow end-to-end

#### Day 3: Landing Page Enhancement
- [ ] Add pricing section to landing
- [ ] Add features section
- [ ] Add "View Pricing" CTAs
- [ ] Improve hero messaging

#### Day 4-5: Upgrade Prompts
- [ ] Create `<UpgradePrompt />` component
- [ ] Create `<PlanBadge />` component
- [ ] Create `usePlanLimits()` hook
- [ ] Add to explore page (limit reached)
- [ ] Add to bonds page (limit reached)
- [ ] Add to lab page (limit reached)
- [ ] Add plan badge to dashboard

#### Day 6-7: Authentication UI
- [ ] Create `/login` page
- [ ] Create `/signup` page
- [ ] Create `<AuthGuard />` component
- [ ] Add auth state management
- [ ] Protect routes
- [ ] Add logout

---

### ✅ Week 2: User Experience

#### Day 1-2: Post-Checkout Flow
- [ ] Create `/checkout/success` page
- [ ] Create `/checkout/cancel` page
- [ ] Handle Stripe redirects
- [ ] Verify subscriptions
- [ ] Update user tier in frontend

#### Day 3-4: Subscription Management
- [ ] Create `/settings/subscription` page
- [ ] Show current plan & usage
- [ ] Add "Manage Billing" (Stripe portal)
- [ ] Handle cancellations

#### Day 5-7: Email Notifications
- [ ] Set up email service
- [ ] Magic link emails
- [ ] Bond invite emails
- [ ] Subscription confirmations

---

## 💰 PRICING RECOMMENDATIONS

### Plan Structure

**FREE** (Forever Free)
- 5 compatibility runs/month
- Solo dashboard
- Unlimited journaling
- ❌ No bonds
- ❌ No Resonance Lab

**PLUS** ($9.99/month or $99/year - 17% off)
- Unlimited compatibility runs
- 1 active bond
- Advanced insights
- ❌ No Resonance Lab

**COUPLE PREMIUM** ($19.99/month or $199/year - 17% off)
- Everything in Plus
- Unlimited bonds
- Resonance Lab access
- Deep compatibility reports

---

## 🎨 UI/UX SPECIFICATIONS

### Pricing Page Layout
```
Header: "Choose Your Plan"
Subheader: "Start free, upgrade anytime"

[FREE Card] [PLUS Card (highlighted)] [COUPLE PREMIUM Card]
  $0/mo        $9.99/mo                  $19.99/mo
  Features     Features                   Features
  [Get Started] [Start Free Trial]       [Start Free Trial]

Feature Comparison Table
- Compatibility Runs: 5 | Unlimited | Unlimited
- Bonds: 0 | 1 | Unlimited
- Resonance Lab: ❌ | ❌ | ✅
- ... (all features)

FAQ Section
```

### Landing Page Enhancements
```
Hero Section (existing)
↓
Features Section (NEW)
- 3 columns: Self-Discovery, Compatibility, Couple Mode
↓
Pricing Section (NEW)
- 3 plan cards (simplified)
- "View Full Pricing" CTA
↓
Testimonials (NEW - placeholder)
↓
FAQ (NEW)
```

---

## 🔧 TECHNICAL SPECIFICATIONS

### API Client Updates
```typescript
// Add to apps/soulmates/lib/api.ts
export const billingApi = {
  // ... existing methods
  getPlans: () => apiRequest("/api/v1/soulmates/billing/plans"),
};
```

### Component Structure
```
apps/soulmates/
  components/
    PricingCard.tsx
    PlanComparison.tsx
    UpgradePrompt.tsx
    PlanBadge.tsx
  hooks/
    usePlanLimits.ts
    useSubscription.ts
  app/
    pricing/
      page.tsx
    checkout/
      success/
        page.tsx
      cancel/
        page.tsx
    settings/
      subscription/
        page.tsx
```

---

## 📊 SUCCESS METRICS

### Launch Targets
- **Pricing Page Views**: 20% of users
- **Checkout Starts**: 10% of pricing views
- **Checkout Completions**: 60% of starts
- **Conversion Rate**: 2-5% (free → paid)

### Revenue Targets
- **Month 1**: $500-1000 MRR
- **Month 3**: $2000-5000 MRR

---

## 🚀 QUICK START (Implement Now)

1. **Add getPlans() to API client** (5 min)
2. **Create pricing page** (2 hours)
3. **Add pricing section to landing** (1 hour)
4. **Test checkout flow** (30 min)

**Total**: ~4 hours to enable monetization

---

**Status**: Ready to implement  
**Priority**: 🔴 CRITICAL - Blocks monetization

