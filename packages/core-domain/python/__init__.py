"""
Core Domain Package (Python)
Shared domain types and utilities for soulmates and syncscript
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass

# Re-export for convenience
__all__ = [
    "ResonanceSummary",
    "getResonanceSummaryForUser",
    "SoulmatesEvent",
    "SoulmatesEventName",
    "logSoulmatesEvent",
]


@dataclass
class ResonanceSummary:
    """Aggregated resonance metrics (safe to share, no raw tasks)"""
    window_start: datetime
    window_end: datetime
    metrics: Dict[str, float]  # e.g. stressIndex, connectionIndex


async def getResonanceSummaryForUser(
    userId: str,
    window: Dict[str, int]  # {"days": 30}
) -> ResonanceSummary:
    """
    Get aggregated resonance summary for a user.
    
    This is a thin integration point with SyncScript's resonance engine.
    Returns only aggregated metrics - no raw tasks or sensitive data.
    
    TODO: Implement actual integration with SyncScript resonance data
    """
    days = window.get("days", 30)
    window_end = datetime.utcnow()
    window_start = window_end - timedelta(days=days)
    
    # Placeholder implementation
    # In production, this would query SyncScript's resonance/telemetry system
    # and return aggregated metrics only
    
    return ResonanceSummary(
        window_start=window_start,
        window_end=window_end,
        metrics={
            "stressIndex": 0.5,  # Placeholder
            "connectionIndex": 0.7,  # Placeholder
            "moodAverage": 0.6,  # Placeholder
        }
    )


# Analytics Events
SoulmatesEventName = str  # Type alias for event names

SoulmatesEventNames = [
    "onboard_completed",
    "profile_viewed_again",
    "prompt_answered",
    "souljourney_entry_created",
    "comp_explorer_run",
    "bond_invite_sent",
    "bond_invite_accepted",
    "bond_ended",
    "bond_dashboard_viewed",
]


@dataclass
class SoulmatesEvent:
    """Soulmates analytics event"""
    name: str
    userId: str
    bondId: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()


def logSoulmatesEvent(event: SoulmatesEvent) -> None:
    """
    Log a soulmates analytics event.
    
    TODO: Forward to analytics provider (PostHog, Mixpanel, etc.)
    """
    if event.timestamp is None:
        event.timestamp = datetime.utcnow()
    
    # Development logging
    import os
    if os.getenv("NODE_ENV") == "development" or os.getenv("ENVIRONMENT") == "development":
        print(f"[soulmates-event] {event.name} | userId={event.userId} | bondId={event.bondId}")
    
    # TODO: Send to analytics provider
    # Example:
    # if POSTHOG_KEY:
    #     posthog.capture(event.userId, event.name, event.payload)
    # elif MIXPANEL_TOKEN:
    #     mixpanel.track(event.userId, event.name, event.payload)

