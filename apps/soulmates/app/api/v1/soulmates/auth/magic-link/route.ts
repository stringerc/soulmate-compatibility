import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, callback_url } = body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { detail: "Valid email address is required" },
        { status: 400 }
      );
    }

    let response: Response;
    try {
      response = await fetch(`${FASTAPI_URL}/api/v1/soulmates/auth/magic-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          callback_url: callback_url || undefined 
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
    } catch (fetchError: any) {
      // Backend not reachable - return helpful error
      console.error("Backend connection error:", fetchError);
      
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch') || fetchError.message?.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { 
            detail: "Authentication service is temporarily unavailable. Please try again in a moment, or use Google Sign-In instead.",
            error: "Backend unreachable"
          },
          { status: 503 }
        );
      }
      
      throw fetchError;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        detail: `Backend returned error: ${response.status} ${response.statusText}` 
      }));
      
      // Return the backend error with appropriate status
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Next.js API route for magic link:", error);
    
    // Handle different error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          detail: "Unable to connect to authentication service. Please check your connection and try again.",
          error: "Connection error"
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        detail: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        error: "Internal Server Error"
      },
      { status: 500 }
    );
  }
}

