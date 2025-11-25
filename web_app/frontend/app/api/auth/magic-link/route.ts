import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendMagicLinkEmail } from '@/lib/email';

/**
 * Magic Link Authentication API (Stateless JWT-based)
 * Research: Magic links preferred by 67% of users (Auth0, 2024)
 * 
 * STATELESS APPROACH: Magic link token is a signed JWT containing email and expiration.
 * This works across serverless function instances (Vercel) without needing Redis/database.
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MAGIC_LINK_EXPIRY_HOURS = 24;

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

    // Generate stateless magic link token (JWT containing email and expiration)
    const magicLinkToken = jwt.sign(
      { 
        email, 
        type: 'magic_link',
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: `${MAGIC_LINK_EXPIRY_HOURS}h` }
    );

    // Generate magic link URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'https://soulmates.syncscript.app';
    const magicLinkUrl = `${appUrl}/api/auth/verify-magic-link?token=${magicLinkToken}`;

    // Send magic link email via Resend
    const emailResult = await sendMagicLinkEmail(email, magicLinkUrl);
    
    // Enhanced logging for debugging
    console.log('[MAGIC LINK]', {
      email,
      appUrl,
      magicLinkUrl: magicLinkUrl.substring(0, 50) + '...',
      emailSuccess: emailResult.success,
      emailMessage: emailResult.message,
      emailId: emailResult.emailId,
      errorDetails: emailResult.errorDetails,
      statusCode: emailResult.statusCode,
      resendConfigured: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@soulmates.syncscript.app',
    });
    
    if (!emailResult.success) {
      // Always return the magic link as fallback if email fails
      console.warn(`[MAGIC LINK] Email failed, returning link as fallback: ${magicLinkUrl}`);
      
      return NextResponse.json({
        success: true,
        message: emailResult.message || 'Email delivery failed, but magic link generated.',
        devLink: magicLinkUrl, // Always include as fallback
        warning: 'Email may not have been delivered. Use the link below to sign in.',
        emailFailed: true,
        errorDetails: emailResult.errorDetails,
      });
    }

    // Email sent successfully
    return NextResponse.json({
      success: true,
      message: 'Magic link sent! Check your email (including spam folder).',
      emailId: emailResult.emailId,
      // Include link as backup even on success (helpful for testing)
      backupLink: process.env.NODE_ENV === 'development' ? magicLinkUrl : undefined,
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}


