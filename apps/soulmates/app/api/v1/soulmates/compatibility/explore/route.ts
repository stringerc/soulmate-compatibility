/**
 * Next.js API Route: Compatibility Proxy
 * 
 * Proxies requests to FastAPI backend for production deployment.
 */

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * POST /api/v1/soulmates/compatibility/explore
 * Run compatibility explorer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    
    let response: Response;
    try {
      response = await fetch(`${FASTAPI_URL}/api/v1/soulmates/compatibility/explore`, {
        method: "POST",
        headers: {
          "Authorization": authHeader || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000), // 10 second timeout for compatibility calculation
      });
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch')) {
        console.warn("Backend not reachable, returning error");
        return NextResponse.json(
          { error: "Backend service unavailable. Please try again later." },
          { status: 503 }
        );
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Failed to calculate compatibility" }));
      return NextResponse.json(
        { error: error.detail || "Failed to calculate compatibility" },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Compatibility API proxy error:", error);
    return NextResponse.json(
      { error: "Backend service unavailable. Please try again later." },
      { status: 503 }
    );
  }
}

