/**
 * Core Domain Package (TypeScript)
 * Shared domain types and utilities for soulmates
 */

export type SoulmatesEventName =
  | "onboard_completed"
  | "profile_viewed_again"
  | "prompt_answered"
  | "souljourney_entry_created"
  | "comp_explorer_run"
  | "bond_invite_sent"
  | "bond_invite_accepted"
  | "bond_ended"
  | "bond_dashboard_viewed";

export interface SoulmatesEvent {
  name: SoulmatesEventName;
  userId: string;
  bondId?: string;
  payload?: Record<string, any>;
  timestamp: Date;
}

/**
 * Log a soulmates analytics event
 * TODO: Forward to analytics provider (PostHog, Mixpanel, etc.)
 */
export function logSoulmatesEvent(
  event: Omit<SoulmatesEvent, "timestamp">
): void {
  const full: SoulmatesEvent = {
    ...event,
    timestamp: new Date(),
  };

  if (process.env.NODE_ENV === "development") {
    console.debug("[soulmates-event]", full);
  }

  // TODO: forward to analytics provider
  // Example:
  // if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  //   posthog.capture(event.userId, event.name, event.payload);
  // }
}

