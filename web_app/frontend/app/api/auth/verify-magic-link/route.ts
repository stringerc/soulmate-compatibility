import { NextRequest, NextResponse } from 'next/server';
import { magicLinks } from '../magic-link/route';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }

    // Verify magic link
    const magicLink = magicLinks.get(token);
    if (!magicLink) {
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
    }

    // Check expiration
    if (Date.now() > magicLink.expiresAt) {
      magicLinks.delete(token);
      return NextResponse.redirect(new URL('/?error=expired_token', request.url));
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { email: magicLink.email, iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Delete used magic link
    magicLinks.delete(token);

    // Redirect with token in URL hash (client-side will extract and store)
    const redirectUrl = new URL('/?auth=success', request.url);
    redirectUrl.hash = `token=${jwtToken}`;
    
    const response = NextResponse.redirect(redirectUrl);
    
    // Also set cookie for server-side access
    response.cookies.set('auth_token', jwtToken, {
      httpOnly: false, // Allow client-side access for localStorage sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('Magic link verification error:', error);
    return NextResponse.redirect(new URL('/?error=verification_failed', request.url));
  }
}

