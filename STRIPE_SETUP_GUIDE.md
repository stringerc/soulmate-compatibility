# Stripe Integration Setup Guide

## ✅ Integration Complete

The Stripe billing integration has been completed. Here's what's implemented:

### Backend Implementation

1. **Payment Adapter** (`packages/core-domain/python/payments.py`)
   - Abstract payment interface
   - Stripe adapter implementation
   - Factory function for creating adapters

2. **Checkout Endpoint** (`api/v1/soulmates/billing.py`)
   - `POST /api/v1/soulmates/billing/checkout` - Creates Stripe checkout session
   - `GET /api/v1/soulmates/billing/subscription` - Gets user subscription
   - `GET /api/v1/soulmates/billing/plans` - Lists available plans

3. **Webhook Handler** (`api/v1/soulmates/stripe_webhook.py`)
   - Handles `checkout.session.completed`
   - Handles `customer.subscription.updated`
   - Handles `customer.subscription.deleted`
   - Verifies webhook signatures

4. **Plan Helpers** (`api/v1/soulmates/plan_helpers.py`)
   - `get_user_soulmates_tier()` - Get user's tier
   - `can_run_comp_explorer()` - Check explorer permissions
   - `can_access_resonance_lab()` - Check lab access
   - `can_create_bond()` - Check bond creation limits

---

## 🔧 Setup Steps

### 1. Set Environment Variables

Add to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=[REDACTED_STRIPE_KEY]
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SOULMATES_PAYMENT_PROVIDER=stripe

# Stripe Price IDs (set after creating products)
STRIPE_PRICE_PLUS_MONTHLY=price_xxxxx
STRIPE_PRICE_COUPLE_PREMIUM_MONTHLY=price_xxxxx

# Frontend URL for checkout redirects
FRONTEND_URL=https://soulmates.syncscript.app
```

### 2. Create Products in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create two products:

   **Product 1: Soulmates Plus**
   - Name: "Soulmates Plus"
   - Description: "Unlimited compatibility exploration"
   - Pricing: Set your monthly price (e.g., $9.99/month)
   - Copy the **Price ID** (starts with `price_`)
   - Set as `STRIPE_PRICE_PLUS_MONTHLY`

   **Product 2: Couple Premium**
   - Name: "Couple Premium"
   - Description: "Full couple features with Resonance Lab"
   - Pricing: Set your monthly price (e.g., $19.99/month)
   - Copy the **Price ID** (starts with `price_`)
   - Set as `STRIPE_PRICE_COUPLE_PREMIUM_MONTHLY`

### 3. Set Up Webhook Endpoint

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://your-backend-url.com/api/v1/soulmates/billing/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Set as `STRIPE_WEBHOOK_SECRET`

### 4. Test the Integration

#### Test Checkout Flow:

```bash
# Create checkout session
curl -X POST http://localhost:8000/api/v1/soulmates/billing/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_slug": "plus"}'
```

Response:
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

#### Test Subscription Status:

```bash
curl http://localhost:8000/api/v1/soulmates/billing/subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📋 Plan Tiers

### FREE
- 5 compatibility explorer runs/month
- 0 active bonds
- No Resonance Lab access

### PLUS
- Unlimited compatibility explorer runs
- 1 active bond
- No Resonance Lab access
- Price: Set in Stripe

### COUPLE_PREMIUM
- Unlimited compatibility explorer runs
- Unlimited active bonds
- Resonance Lab access
- Price: Set in Stripe

---

## 🔒 Security Notes

1. **Never commit `.env` files** - The Stripe secret key is sensitive
2. **Use test keys for development** - Use `sk_test_...` keys locally
3. **Webhook signature verification** - Always verify webhook signatures in production
4. **HTTPS required** - Stripe webhooks require HTTPS endpoints

---

## 🐛 Troubleshooting

### "Payment system not configured"
- Check `STRIPE_SECRET_KEY` is set
- Verify Stripe package is installed: `pip install stripe`

### "Stripe price ID not configured"
- Create products in Stripe dashboard
- Set `STRIPE_PRICE_PLUS_MONTHLY` and `STRIPE_PRICE_COUPLE_PREMIUM_MONTHLY`

### Webhook not receiving events
- Verify webhook URL is accessible
- Check webhook secret matches `STRIPE_WEBHOOK_SECRET`
- Ensure endpoint is HTTPS (required for production)

---

## ✅ Integration Status

- ✅ Payment adapter created
- ✅ Checkout endpoint implemented
- ✅ Webhook handler implemented
- ✅ Plan helpers created
- ✅ Subscription management working
- ⚠️ Need to create Stripe products and set price IDs
- ⚠️ Need to configure webhook endpoint in Stripe dashboard

The integration is **code-complete** and ready for Stripe dashboard configuration!

