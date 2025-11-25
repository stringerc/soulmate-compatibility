/**
 * Analytics Provider Component
 * Initializes PostHog and Mixpanel on client-side
 */

"use client";

import { useEffect } from "react";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PostHog if configured
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      import("posthog-js").then((posthogModule) => {
        const posthog = posthogModule.default;
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
          loaded: () => {
            if (process.env.NODE_ENV === "development") {
              console.debug("[Analytics] PostHog initialized");
            }
          },
        });
        // Make posthog available globally for analytics.ts
        (window as any).posthog = posthog;
      }).catch((error) => {
        console.warn("[Analytics] Failed to load PostHog:", error);
      });
    }

    // Initialize Mixpanel if configured
    if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      import("mixpanel-browser").then((mixpanelModule) => {
        const mixpanel = mixpanelModule.default;
        mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!, {
          debug: process.env.NODE_ENV === "development",
        });
        if (process.env.NODE_ENV === "development") {
          console.debug("[Analytics] Mixpanel initialized");
        }
        // Make mixpanel available globally for analytics.ts
        (window as any).mixpanel = mixpanel;
      }).catch((error) => {
        console.warn("[Analytics] Failed to load Mixpanel:", error);
      });
    }
  }, []);

  return <>{children}</>;
}

