import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const magicLinkToken = searchParams.get('token');

    if (!magicLinkToken) {
      console.error('[AUTH] No token provided in magic link');
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }

    // Verify and decode the magic link JWT token (stateless verification)
    let decoded: any;
    try {
      decoded = jwt.verify(magicLinkToken, JWT_SECRET);
      
      // Verify it's a magic link token (not a regular auth token)
      if (decoded.type !== 'magic_link') {
        console.error('[AUTH] Token is not a magic link token');
        return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
      }
      
      if (!decoded.email) {
        console.error('[AUTH] Token missing email');
        return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
      }
    } catch (error: any) {
      // JWT verification failed (expired, invalid signature, etc.)
      console.error('[AUTH] Magic link token verification failed:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return NextResponse.redirect(new URL('/?error=expired_token', request.url));
      }
      
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }

    // Generate session JWT token (long-lived, for user authentication)
    const sessionToken = jwt.sign(
      { 
        email: decoded.email, 
        type: 'session',
        iat: Math.floor(Date.now() / 1000) 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('[AUTH] Magic link verified successfully for:', decoded.email);

    // Get the base URL (use environment variable or construct from request)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (request.headers.get('host') ? `https://${request.headers.get('host')}` : 'https://soulmates.syncscript.app');
    
    // Redirect with token in URL hash (client-side will extract and store)
    // Use the full URL with hash - Next.js will preserve the hash
    const redirectUrl = `${baseUrl}/?auth=success&email=${encodeURIComponent(decoded.email)}#token=${encodeURIComponent(sessionToken)}`;
    
    const response = NextResponse.redirect(redirectUrl);
    
    // Also set cookie for server-side access
    response.cookies.set('auth_token', sessionToken, {
      httpOnly: false, // Allow client-side access for localStorage sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    console.log('[AUTH] Magic link verified, redirecting to:', redirectUrl.substring(0, 100) + '...');

    return response;
  } catch (error) {
    console.error('Magic link verification error:', error);
    return NextResponse.redirect(new URL('/?error=verification_failed', request.url));
  }
}

