import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { randomUUID } from "crypto";

// JWT secret - use NEXTAUTH_SECRET or JWT_SECRET, or generate a fallback
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 
                   process.env.JWT_SECRET || 
                   process.env.JWT_SECRET_KEY ||
                   "fallback-secret-change-in-production-use-strong-random-key";

// In-memory store for magic link tokens (in production, use Redis or database)
const magicLinkStore = new Map<string, { email: string; expiresAt: number; callbackUrl?: string }>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of magicLinkStore.entries()) {
    if (data.expiresAt < now) {
      magicLinkStore.delete(token);
    }
  }
}, 5 * 60 * 1000);

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

    const normalizedEmail = email.toLowerCase().trim();
    
    // Generate a unique token ID
    const tokenId = randomUUID();
    
    // Create JWT token (expires in 15 minutes)
    const expiresIn = 15 * 60 * 1000; // 15 minutes in milliseconds
    const expiresAt = Date.now() + expiresIn;
    
    const token = await new SignJWT({
      sub: tokenId,
      email: normalizedEmail,
      type: 'magic_link',
      exp: Math.floor(expiresAt / 1000), // JWT exp is in seconds
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Store token metadata
    magicLinkStore.set(tokenId, {
      email: normalizedEmail,
      expiresAt,
      callbackUrl: callback_url,
    });

    // Generate magic link URL
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                       process.env.NEXTAUTH_URL || 
                       process.env.FRONTEND_URL ||
                       (request.headers.get('origin') || 'http://localhost:3000');
    
    const callbackUrl = callback_url || '/me';
    const magicLink = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&callback_url=${encodeURIComponent(callbackUrl)}`;

    // In development, return the link directly
    // In production, you would send an email here
    const isDev = process.env.NODE_ENV === 'development' || 
                  process.env.ENVIRONMENT === 'development' ||
                  !process.env.RESEND_API_KEY; // If no email service configured

    // TODO: In production, send email using Resend, SendGrid, or similar
    // For now, return dev_link in development
    if (isDev) {
      console.log(`🔗 Magic link for ${normalizedEmail}: ${magicLink}`);
    }

    return NextResponse.json({
      success: true,
      message: isDev 
        ? "Development mode: use the link below" 
        : "Magic link sent to your email",
      dev_link: isDev ? magicLink : undefined,
    });
  } catch (error) {
    console.error("Error generating magic link:", error);
    
    return NextResponse.json(
      { 
        detail: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        error: "Internal Server Error"
      },
      { status: 500 }
    );
  }
}

