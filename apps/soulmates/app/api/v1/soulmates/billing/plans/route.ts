import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    // Check if backend is reachable
    let response: Response;
    try {
      response = await fetch(`${FASTAPI_URL}/api/v1/soulmates/billing/plans`, {
        method: "GET",
        headers: {
          "Authorization": authHeader || "",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
    } catch (fetchError: any) {
      // Backend not reachable - return fallback plans
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch')) {
        console.warn("Backend not reachable, returning fallback plans");
        return NextResponse.json({
          plans: [
            {
              slug: "free",
              name: "Free",
              description: "Basic features for self-discovery",
              tier: "FREE",
              max_comp_explorer_runs_per_month: 5,
              max_active_bonds: 0,
              includes_resonance_lab: false,
            },
            {
              slug: "plus",
              name: "Plus",
              description: "Unlimited compatibility exploration",
              tier: "PLUS",
              max_comp_explorer_runs_per_month: null,
              max_active_bonds: 1,
              includes_resonance_lab: false,
            },
            {
              slug: "couple-premium",
              name: "Couple Premium",
              description: "Full couple features with Resonance Lab",
              tier: "COUPLE_PREMIUM",
              max_comp_explorer_runs_per_month: null,
              max_active_bonds: null,
              includes_resonance_lab: true,
            },
          ],
        });
      }
      throw fetchError;
    }

    if (!response.ok) {
      // If backend returns 500 or other errors, return fallback plans
      if (response.status >= 500) {
        console.warn("Backend returned error, returning fallback plans");
        return NextResponse.json({
          plans: [
            {
              slug: "free",
              name: "Free",
              description: "Basic features for self-discovery",
              tier: "FREE",
              max_comp_explorer_runs_per_month: 5,
              max_active_bonds: 0,
              includes_resonance_lab: false,
            },
            {
              slug: "plus",
              name: "Plus",
              description: "Unlimited compatibility exploration",
              tier: "PLUS",
              max_comp_explorer_runs_per_month: null,
              max_active_bonds: 1,
              includes_resonance_lab: false,
            },
            {
              slug: "couple-premium",
              name: "Couple Premium",
              description: "Full couple features with Resonance Lab",
              tier: "COUPLE_PREMIUM",
              max_comp_explorer_runs_per_month: null,
              max_active_bonds: null,
              includes_resonance_lab: true,
            },
          ],
        });
      }
      const errorData = await response.json().catch(() => ({ detail: "Unknown backend error" }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Next.js API route for billing plans:", error);
    // Return fallback plans on any error
    return NextResponse.json({
      plans: [
        {
          slug: "free",
          name: "Free",
          description: "Basic features for self-discovery",
          tier: "FREE",
          max_comp_explorer_runs_per_month: 5,
          max_active_bonds: 0,
          includes_resonance_lab: false,
        },
        {
          slug: "plus",
          name: "Plus",
          description: "Unlimited compatibility exploration",
          tier: "PLUS",
          max_comp_explorer_runs_per_month: null,
          max_active_bonds: 1,
          includes_resonance_lab: false,
        },
        {
          slug: "couple-premium",
          name: "Couple Premium",
          description: "Full couple features with Resonance Lab",
          tier: "COUPLE_PREMIUM",
          max_comp_explorer_runs_per_month: null,
          max_active_bonds: null,
          includes_resonance_lab: true,
        },
      ],
    });
  }
}

