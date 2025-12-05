/**
 * Next.js API Route: Compatibility Proxy
 * 
 * Proxies requests to FastAPI backend for production deployment.
 * Falls back to client-side calculation if backend is unavailable.
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
    
    // Try backend first
    let response: Response;
    try {
      response = await fetch(`${FASTAPI_URL}/api/v1/soulmates/compatibility/explore`, {
        method: "POST",
        headers: {
          "Authorization": authHeader || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (fetchError: any) {
      // Backend unavailable - this is expected in development
      // Frontend will use client-side calculation instead
      if (process.env.NODE_ENV === 'development') {
        console.log("Backend not available, frontend will use client-side calculation");
      }
    }
    
    // Backend unavailable - return graceful error
    // Frontend already has client-side fallback
    return NextResponse.json(
      { 
        error: "Backend service unavailable. Using client-side calculation.",
        fallback: true 
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Compatibility API proxy error:", error);
    return NextResponse.json(
      { 
        error: "Backend service unavailable. Using client-side calculation.",
        fallback: true 
      },
      { status: 503 }
    );
  }
}

