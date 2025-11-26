import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Force dynamic rendering since we use request.headers
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const searchParams = request.nextUrl.searchParams;
    const bondId = searchParams.get("bond_id");

    const url = new URL(`${FASTAPI_URL}/api/v1/soulmates/billing/subscription`);
    if (bondId) {
      url.searchParams.set("bond_id", bondId);
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Authorization": authHeader || "",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
    } catch (fetchError: any) {
      // Backend not reachable - return fallback subscription (FREE tier)
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch')) {
        console.warn("Backend not reachable, returning fallback subscription");
        return NextResponse.json({
          tier: "FREE",
          plan_slug: "free",
          status: "active",
          max_comp_explorer_runs_per_month: 5,
          max_active_bonds: 0,
          includes_resonance_lab: false,
        });
      }
      throw fetchError;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown backend error" }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Next.js API route for subscription:", error);
    // Return fallback on any error
    return NextResponse.json({
      tier: "FREE",
      plan_slug: "free",
      status: "active",
      max_comp_explorer_runs_per_month: 5,
      max_active_bonds: 0,
      includes_resonance_lab: false,
    });
  }
}

