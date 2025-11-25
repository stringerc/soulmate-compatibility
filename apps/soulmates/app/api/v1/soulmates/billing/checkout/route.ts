import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization");

    let response: Response;
    try {
      response = await fetch(`${FASTAPI_URL}/api/v1/soulmates/billing/checkout`, {
        method: "POST",
        headers: {
          "Authorization": authHeader || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('fetch')) {
        console.warn("Backend not reachable for checkout");
        return NextResponse.json(
          { error: "Payment service unavailable. Please try again later." },
          { status: 503 }
        );
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
    console.error("Error in Next.js API route for checkout:", error);
    return NextResponse.json(
      { error: "Payment service unavailable. Please try again later." },
      { status: 503 }
    );
  }
}

