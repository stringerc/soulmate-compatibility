"""
Stripe Webhook Setup Helper
Provides instructions and validates webhook configuration
"""

import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def print_webhook_setup_instructions():
    """Print instructions for setting up Stripe webhook"""
    print("=" * 60)
    print("STRIPE WEBHOOK SETUP INSTRUCTIONS")
    print("=" * 60)
    print()
    print("1. Go to: https://dashboard.stripe.com/webhooks")
    print()
    print("2. Click 'Add endpoint'")
    print()
    print("3. Endpoint URL:")
    print("   https://your-backend-url.com/api/v1/soulmates/billing/webhook")
    print("   (Replace 'your-backend-url.com' with your actual backend URL)")
    print()
    print("4. Select events to listen to:")
    print("   ✓ checkout.session.completed")
    print("   ✓ customer.subscription.updated")
    print("   ✓ customer.subscription.deleted")
    print()
    print("5. Click 'Add endpoint'")
    print()
    print("6. Copy the 'Signing secret' (starts with 'whsec_')")
    print()
    print("7. Add to your .env file:")
    print("   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here")
    print()
    print("=" * 60)
    print()
    
    # Check if webhook secret is already set
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if webhook_secret:
        print("✅ STRIPE_WEBHOOK_SECRET is already set in environment")
        print(f"   Current value: {webhook_secret[:10]}...")
    else:
        print("⚠️  STRIPE_WEBHOOK_SECRET is not set")
        print("   Follow the instructions above to set it up")
    print()

if __name__ == "__main__":
    print_webhook_setup_instructions()

