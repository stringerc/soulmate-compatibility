import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

// JWT secret - must match the one used in magic-link route
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 
                   process.env.JWT_SECRET || 
                   process.env.JWT_SECRET_KEY ||
                   "fallback-secret-change-in-production-use-strong-random-key";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    try {
      // Verify JWT token
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET),
        {
          algorithms: ['HS256'],
        }
      );

      // Validate token type
      if (payload.type !== 'magic_link') {
        return NextResponse.json(
          { error: "Invalid token type" },
          { status: 401 }
        );
      }

      // Extract user info
      const email = payload.email as string;
      const userId = payload.sub as string;

      if (!email || !userId) {
        return NextResponse.json(
          { error: "Invalid token payload" },
          { status: 401 }
        );
      }

      // Generate a session token (longer-lived, for user session)
      const sessionToken = await new SignJWT({
        sub: userId,
        email: email,
        type: 'session',
        exp: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000), // 30 days
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(new TextEncoder().encode(JWT_SECRET));

      return NextResponse.json({
        success: true,
        token: sessionToken,
        user: {
          id: userId,
          email: email,
        },
      });
    } catch (verifyError: any) {
      console.error("Token verification error:", verifyError);
      
      if (verifyError.code === 'ERR_JWT_EXPIRED' || verifyError.message?.includes('expired')) {
        return NextResponse.json(
          { error: "Token has expired. Please request a new magic link." },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error in Next.js API route for verify:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

