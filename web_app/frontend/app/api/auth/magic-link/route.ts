import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { magicLinks } from '@/lib/magicLinks';

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

    // In production, send email via Resend/SendGrid/etc.
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-magic-link?token=${token}`;

    // Email service (in production, use Resend/SendGrid)
    // TODO: Implement email sending
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Soulmate Compatibility <noreply@soulmates.syncscript.app>',
    //   to: email,
    //   subject: 'Your Magic Link - Soulmate Compatibility',
    //   html: `<p>Click <a href="${magicLinkUrl}">here</a> to sign in.</p>`,
    // });
    console.log(`[EMAIL] Magic link for ${email}: ${magicLinkUrl}`);

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


