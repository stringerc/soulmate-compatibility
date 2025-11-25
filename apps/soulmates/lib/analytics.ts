/**
 * Analytics utilities for Soulmates app
 * Logs events for tracking user behavior
 */

import { getCurrentUserId } from "./auth";

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
 * Get current user ID for analytics
 * Automatically extracts from JWT token if not provided
 */
function getUserIdForAnalytics(providedUserId?: string): string {
  // Use provided user ID if available
  if (providedUserId && providedUserId !== "current_user") {
    return providedUserId;
  }
  
  // Try to get from auth token
  const userId = getCurrentUserId();
  if (userId) {
    return userId;
  }
  
  // Fallback to anonymous
  return "anonymous";
}

/**
 * Log a soulmates analytics event
 * Automatically extracts user ID from JWT token if not provided
 */
export function logSoulmatesEvent(
  event: Omit<SoulmatesEvent, "timestamp" | "userId"> & { userId?: string }
): void {
  const userId = getUserIdForAnalytics(event.userId);
  
  const full: SoulmatesEvent = {
    ...event,
    userId,
    timestamp: new Date(),
  };

  if (process.env.NODE_ENV === "development") {
    console.debug("[soulmates-event]", full);
  }

  // Forward to PostHog if configured (initialized by AnalyticsProvider)
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    try {
      const posthog = (window as any).posthog;
      if (posthog) {
        posthog.capture(full.name, {
          distinct_id: full.userId,
          bondId: full.bondId,
          ...full.payload,
        });
      }
    } catch (e) {
      // PostHog not available, continue silently
    }
  }

  // Forward to Mixpanel if configured (initialized by AnalyticsProvider)
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
    try {
      const mixpanel = (window as any).mixpanel;
      if (mixpanel) {
        mixpanel.track(full.name, {
          userId: full.userId,
          bondId: full.bondId,
          ...full.payload,
        });
      }
    } catch (e) {
      // Mixpanel not available, continue silently
    }
  }

  // Also send to backend for server-side tracking
  if (typeof window !== "undefined") {
    fetch("/api/soulmates/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(full),
    }).catch(() => {
      // Fail silently if backend is not available
    });
  }
}

// StoryQuest analytics functions
export function trackScenarioStart(scenarioIndex: number, chapter: string) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics] Scenario started", { scenarioIndex, chapter });
  }
}

export function trackScenarioComplete(scenarioIndex: number, chapter: string, timeSpent: number) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics] Scenario completed", { scenarioIndex, chapter, timeSpent });
  }
}

export function trackCompletion(personNumber: number, success: boolean, totalScenarios: number, answeredCount: number) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics] Completion tracked", { personNumber, success, totalScenarios, answeredCount });
  }
}

export function trackDropOff(personNumber: number, scenarioIndex: number, chapter: string, reason?: string) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics] Drop-off tracked", { personNumber, scenarioIndex, chapter, reason });
  }
}

export function trackButtonClick(buttonName: string, context?: string) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics] Button clicked", { buttonName, context });
  }
}

