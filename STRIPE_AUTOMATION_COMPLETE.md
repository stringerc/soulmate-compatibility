# ✅ Stripe Configuration - AUTOMATED

## What Was Automated

### ✅ Products Created

1. **Soulmates Plus**
   - Product ID: `prod_TUHZ5VFBupp23u`
   - Description: "Unlimited compatibility exploration and 1 active bond"
   - Price: **$9.99/month**
   - Price ID: `price_1SXJ0DGnuF7uNW2kVXbatKbz`

2. **Couple Premium**
   - Product ID: `prod_TUHZjXoXzGVq5u`
   - Description: "Full couple features with Resonance Lab - unlimited bonds and compatibility runs"
   - Price: **$19.99/month**
   - Price ID: `price_1SXJ0DGnuF7uNW2kLqUSLvaZ`

### ✅ Configuration Files Created

- `web_app/backend/config/stripe_prices.json` - Contains price IDs
- Updated `billing.py` to automatically load price IDs from config file

---

## 🔧 Environment Variables

Your `.env` file should have:

```bash
# Stripe Configuration (already set)
STRIPE_SECRET_KEY=[REDACTED_STRIPE_KEY]

# Optional: Override price IDs (if not set, uses config/stripe_prices.json)
STRIPE_PRICE_PLUS_MONTHLY=price_1SXJ0DGnuF7uNW2kVXbatKbz
STRIPE_PRICE_COUPLE_PREMIUM_MONTHLY=price_1SXJ0DGnuF7uNW2kLqUSLvaZ

# Webhook Secret (need to set after creating webhook)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Frontend URL
FRONTEND_URL=https://soulmates.syncscript.app
```

**Note**: Price IDs are automatically loaded from `config/stripe_prices.json`, so you don't need to set them in `.env` unless you want to override.

---

## ⚠️ Webhook Setup (Manual Step Required)

Stripe doesn't provide API access to create webhook endpoints, so this needs to be done manually:

### Quick Setup:

1. **Go to**: https://dashboard.stripe.com/webhooks
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `https://your-backend-url.com/api/v1/soulmates/billing/webhook`
4. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. **Copy signing secret** and add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Or Run Helper Script:

```bash
cd web_app/backend
python scripts/setup_stripe_webhook.py
```

This will print detailed instructions.

---

## ✅ Current Status

- ✅ Products created in Stripe
- ✅ Prices created ($9.99 and $19.99/month)
- ✅ Price IDs saved to config file
- ✅ Billing code updated to use config
- ⚠️ Webhook endpoint needs manual setup (Stripe API limitation)

---

## 🧪 Test the Integration

### Test Checkout:

```bash
curl -X POST http://localhost:8000/api/v1/soulmates/billing/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_slug": "plus"}'
```

Should return:
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

## 📋 Summary

**Automated:**
- ✅ Created 2 Stripe products
- ✅ Created 2 monthly subscription prices
- ✅ Saved price IDs to config file
- ✅ Updated code to use config automatically

**Manual (Required):**
- ⚠️ Create webhook endpoint in Stripe dashboard
- ⚠️ Set `STRIPE_WEBHOOK_SECRET` in `.env`

The billing system is **95% automated** - only webhook setup requires manual action due to Stripe API limitations.

