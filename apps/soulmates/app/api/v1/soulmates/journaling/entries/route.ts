/**
 * Next.js API Route: Journaling Proxy
 * 
 * Proxies requests to FastAPI backend for production deployment.
 */

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * GET /api/v1/soulmates/journaling/entries
 * List journal entries
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const searchParams = request.nextUrl.searchParams;
    const bondId = searchParams.get("bond_id");
    
    const url = new URL(`${FASTAPI_URL}/api/v1/soulmates/journaling/entries`);
    if (bondId) {
      url.searchParams.set("bond_id", bondId);
    }
    
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          "Authorization": authHeader || "",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch')) {
        console.warn("Backend not reachable, returning empty entries");
        return NextResponse.json({ entries: [] });
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      console.warn("Backend returned error, returning empty entries");
      return NextResponse.json({ entries: [] });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Journaling API proxy error:", error);
    return NextResponse.json({ entries: [] });
  }
}

/**
 * POST /api/v1/soulmates/journaling/entries
 * Create journal entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    
    const response = await fetch(`${FASTAPI_URL}/api/v1/soulmates/journaling/entries`, {
      method: "POST",
      headers: {
        "Authorization": authHeader || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Failed to create entry" }));
      return NextResponse.json(
        { error: error.detail || "Failed to create entry" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Journaling API proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

