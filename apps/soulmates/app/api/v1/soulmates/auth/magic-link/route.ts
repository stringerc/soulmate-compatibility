import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { randomUUID } from "crypto";
import { Resend } from "resend";

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

    // Check if Resend is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const isDev = process.env.NODE_ENV === 'development' || 
                  process.env.ENVIRONMENT === 'development' ||
                  !resendApiKey; // If no email service configured

    let emailSent = false;
    let devLink: string | undefined = undefined;

    // Try to send email via Resend if configured
    if (resendApiKey && !isDev) {
      try {
        const resend = new Resend(resendApiKey);
        
        const fromEmail = process.env.RESEND_FROM_EMAIL || 
                         process.env.FROM_EMAIL || 
                         'onboarding@resend.dev'; // Default Resend domain
        
        const emailResult = await resend.emails.send({
          from: `Soulmate Compatibility <${fromEmail}>`,
          to: normalizedEmail,
          subject: 'Sign In to Soulmate Compatibility - Secure Link',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Magic Link</title>
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">✨ Your Magic Link</h1>
                </div>
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hello!</p>
                  <p style="font-size: 16px; margin-bottom: 20px;">Click the button below to sign in to your Soulmate Compatibility account. This link will expire in 15 minutes.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Sign In Securely</a>
                  </div>
                  <p style="font-size: 14px; color: #6b7280; margin-top: 30px; margin-bottom: 10px;">Or copy and paste this link into your browser:</p>
                  <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">${magicLink}</p>
                  <p style="font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">If you didn't request this link, you can safely ignore this email.</p>
                </div>
              </body>
            </html>
          `,
          text: `Sign in to Soulmate Compatibility\n\nClick this link to sign in: ${magicLink}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this link, you can safely ignore this email.`,
        });

        if (emailResult.data?.id) {
          emailSent = true;
          console.log(`✅ Email sent via Resend to ${normalizedEmail} (ID: ${emailResult.data.id})`);
        } else {
          console.warn(`⚠️ Resend returned no email ID:`, emailResult.error);
          // Fall back to dev_link if email sending fails
          devLink = magicLink;
        }
      } catch (emailError: any) {
        console.error("❌ Error sending email via Resend:", emailError);
        // Fall back to dev_link if email sending fails
        devLink = magicLink;
      }
    } else {
      // Development mode or no Resend configured - return dev_link
      devLink = magicLink;
      console.log(`🔗 Magic link for ${normalizedEmail}: ${magicLink}`);
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? "Magic link sent to your email" 
        : isDev 
          ? "Development mode: use the link below" 
          : "Magic link generated (email service not configured)",
      dev_link: devLink,
      email_sent: emailSent,
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

