/**
 * Analytics endpoint - accepts POST requests for tracking events
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In production, you would forward this to your analytics service
    // For now, just log it (or forward to PostHog/Mixpanel/etc.)
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", body);
    }
    
    // TODO: Forward to PostHog, Mixpanel, or your analytics service
    // Example:
    // await posthog.capture(body.userId, body.name, body.payload);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Fail silently - analytics should never break the app
    console.error("Analytics error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

