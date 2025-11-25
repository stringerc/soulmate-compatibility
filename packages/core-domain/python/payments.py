"""
Payment Adapter Interface
Stripe-first, abstracted for future gateway swaps
"""

from typing import Dict, Optional, Protocol
from abc import ABC, abstractmethod


class PaymentAdapter(ABC):
    """Abstract payment adapter interface"""
    
    @abstractmethod
    async def create_checkout_session(
        self,
        mode: str,  # "subscription" or "payment"
        price_id: str,
        success_url: str,
        cancel_url: str,
        customer_id: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
    ) -> Dict[str, str]:
        """Create a checkout session and return URL"""
        pass


def create_payment_adapter() -> PaymentAdapter:
    """
    Factory function to create payment adapter based on environment
    """
    import os
    provider = os.getenv("SOULMATES_PAYMENT_PROVIDER", "stripe")
    
    if provider == "stripe":
        return create_stripe_adapter()
    else:
        raise ValueError(f"Unknown payment provider: {provider}")


def create_stripe_adapter() -> PaymentAdapter:
    """Create Stripe payment adapter"""
    import os
    stripe_secret = os.getenv("STRIPE_SECRET_KEY")
    
    if not stripe_secret:
        raise ValueError("STRIPE_SECRET_KEY not set")
    
    try:
        import stripe
        stripe.api_key = stripe_secret
        
        class StripeAdapter(PaymentAdapter):
            async def create_checkout_session(
                self,
                mode: str,
                price_id: str,
                success_url: str,
                cancel_url: str,
                customer_id: Optional[str] = None,
                metadata: Optional[Dict[str, str]] = None,
            ) -> Dict[str, str]:
                session = stripe.checkout.Session.create(
                    mode=mode,
                    line_items=[{"price": price_id, "quantity": 1}],
                    success_url=success_url,
                    cancel_url=cancel_url,
                    customer=customer_id,
                    metadata=metadata or {},
                )
                return {"url": session.url}
        
        return StripeAdapter()
    except ImportError:
        raise ImportError("stripe package not installed. Run: pip install stripe")

