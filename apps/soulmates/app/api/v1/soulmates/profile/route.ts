/**
 * Next.js API Route: Profile Proxy
 * 
 * Proxies requests to FastAPI backend for production deployment.
 */

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * GET /api/v1/soulmates/profile
 * Get user's soul profile
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    let response: Response;
    try {
      response = await fetch(`${FASTAPI_URL}/api/v1/soulmates/profile`, {
        headers: {
          "Authorization": authHeader || "",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch')) {
        console.warn("Backend not reachable, returning empty profile");
        return NextResponse.json({ profile: null });
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      console.warn("Backend returned error, returning empty profile");
      return NextResponse.json({ profile: null });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile API proxy error:", error);
    return NextResponse.json({ profile: null });
  }
}

/**
 * POST /api/v1/soulmates/profile
 * Create or update soul profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    
    const response = await fetch(`${FASTAPI_URL}/api/v1/soulmates/profile`, {
      method: "POST",
      headers: {
        "Authorization": authHeader || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Failed to update profile" }));
      return NextResponse.json(
        { error: error.detail || "Failed to update profile" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile API proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

