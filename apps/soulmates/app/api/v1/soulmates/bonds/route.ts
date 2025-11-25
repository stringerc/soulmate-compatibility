/**
 * Next.js API Route: Bonds Proxy
 * 
 * Proxies requests to FastAPI backend for production deployment.
 */

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * GET /api/v1/soulmates/bonds
 * List bonds
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    
    const url = new URL(`${FASTAPI_URL}/api/v1/soulmates/bonds`);
    if (status) {
      url.searchParams.set("status", status);
    }
    
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          "Authorization": authHeader || "",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
    } catch (fetchError: any) {
      // Backend not reachable - return empty bonds array
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch')) {
        console.warn("Backend not reachable, returning empty bonds");
        return NextResponse.json({ bonds: [] });
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Failed to fetch bonds" }));
      // Return empty array instead of error for better UX
      console.warn("Backend returned error, returning empty bonds:", error);
      return NextResponse.json({ bonds: [] });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Bonds API proxy error:", error);
    // Return empty array on any error
    return NextResponse.json({ bonds: [] });
  }
}

