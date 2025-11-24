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


