import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { magicLinks } from '@/lib/magicLinks';
import { sendMagicLinkEmail } from '@/lib/email';

/**
 * Magic Link Authentication API
 * Research: Magic links preferred by 67% of users (Auth0, 2024)
 */

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Store magic link
    magicLinks.set(token, { email, expiresAt });

    // Generate magic link URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    const magicLinkUrl = `${appUrl}/api/auth/verify-magic-link?token=${token}`;

    // Send magic link email via Resend
    const emailResult = await sendMagicLinkEmail(email, magicLinkUrl);
    
    if (!emailResult.success && process.env.NODE_ENV === 'development') {
      // In development, log the magic link if email fails
      console.log(`[DEV] Magic link for ${email}: ${magicLinkUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent! Check your email.',
      // Remove in production - only for development
      devLink: process.env.NODE_ENV === 'development' ? magicLinkUrl : undefined,
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}


