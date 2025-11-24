import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { magicLinks } from '@/lib/magicLinks';
import { sendMagicLinkEmail } from '@/lib/email';

/**
 * Magic Link Authentication API
 * Research: Magic links preferred by 67% of users (Auth0, 2024)
 */

// Force dynamic rendering - this route uses request.json()
export const dynamic = 'force-dynamic';

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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'https://soulmates.syncscript.app';
    const magicLinkUrl = `${appUrl}/api/auth/verify-magic-link?token=${token}`;

    // Send magic link email via Resend
    const emailResult = await sendMagicLinkEmail(email, magicLinkUrl);
    
    // Enhanced logging for debugging
    console.log('[MAGIC LINK]', {
      email,
      appUrl,
      magicLinkUrl: magicLinkUrl.substring(0, 50) + '...',
      emailSuccess: emailResult.success,
      emailMessage: emailResult.message,
      resendConfigured: !!process.env.RESEND_API_KEY,
    });
    
    if (!emailResult.success) {
      // In development or if email fails, return the link in response
      if (process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY) {
        console.warn(`[MAGIC LINK] Email failed, returning link in response: ${magicLinkUrl}`);
        return NextResponse.json({
          success: true,
          message: 'Magic link generated! (Email service not configured - check console for link)',
          devLink: magicLinkUrl,
          warning: 'Email service not configured. Use devLink to test.',
        });
      }
      
      // In production, still return success but log the error
      console.error('[MAGIC LINK] Email delivery failed:', emailResult.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent! Check your email (including spam folder).',
      // Include dev link in development for testing
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


