/**
 * Email Service Integration
 * Using Resend API for magic link emails
 * 
 * Research: Resend provides 100 emails/day free, 99.9% deliverability (Resend, 2024)
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  message?: string;
  emailId?: string;
  errorDetails?: any;
  statusCode?: number;
  error?: string;
}

/**
 * Send email using Resend API
 */
export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = from || process.env.RESEND_FROM_EMAIL || 'noreply@soulmates.syncscript.app';

  if (!apiKey) {
    console.warn('[EMAIL] RESEND_API_KEY not configured. Email not sent.');
    // In development, log the email content
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}`);
      console.log(`[DEV EMAIL] Content: ${html}`);
    }
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject,
        html,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('[EMAIL] Resend API error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
      });
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to send email';
      if (responseData.message) {
        errorMessage = responseData.message;
      } else if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check Resend configuration.';
      } else if (response.status === 422) {
        errorMessage = 'Invalid email address or domain not verified.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
      }
      
      return { 
        success: false, 
        message: errorMessage,
        errorDetails: responseData,
        statusCode: response.status,
      };
    }

    console.log('[EMAIL] Successfully sent:', {
      emailId: responseData.id,
      to,
      from: fromEmail,
    });

    return { 
      success: true,
      emailId: responseData.id,
    };
  } catch (error) {
    console.error('[EMAIL] Network error sending email:', error);
    return { 
      success: false, 
      message: 'Network error. Please check your connection and try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send magic link email
 */
export async function sendMagicLinkEmail(email: string, magicLinkUrl: string): Promise<EmailResult> {
  // Extract token for manual entry option
  const urlObj = new URL(magicLinkUrl);
  const token = urlObj.searchParams.get('token') || '';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign In to Soulmate Compatibility</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✨ Sign In to Your Account</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; margin-bottom: 20px; color: #111827;">
            You requested to sign in to your Soulmate Compatibility account. Use one of the methods below to complete sign-in.
          </p>
          
          <!-- Method 1: Direct Link -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #ec4899;">
            <p style="font-weight: 600; margin-bottom: 10px; color: #111827;">Method 1: Click the button below</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${magicLinkUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Sign In to Your Account
              </a>
            </div>
            <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
              If your email client blocks the link, use Method 2 below.
            </p>
          </div>
          
          <!-- Method 2: Manual Entry -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #8b5cf6;">
            <p style="font-weight: 600; margin-bottom: 10px; color: #111827;">Method 2: Manual Entry (If link is blocked)</p>
            <p style="font-size: 14px; color: #374151; margin-bottom: 15px;">
              1. Go to: <strong>https://soulmates.syncscript.app</strong>
            </p>
            <p style="font-size: 14px; color: #374151; margin-bottom: 15px;">
              2. Click "Sign In" button
            </p>
            <p style="font-size: 14px; color: #374151; margin-bottom: 15px;">
              3. Enter your email: <strong>${email}</strong>
            </p>
            <p style="font-size: 14px; color: #374151; margin-bottom: 15px;">
              4. When prompted, enter this code:
            </p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0;">
              <code style="font-size: 18px; font-weight: 600; color: #111827; letter-spacing: 2px; word-break: break-all;">${token}</code>
            </div>
            <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
              Or visit this URL directly: <br>
              <span style="word-break: break-all; color: #8b5cf6;">${magicLinkUrl}</span>
            </p>
          </div>
          
          <!-- Security Notice -->
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-top: 20px;">
            <p style="font-size: 13px; color: #92400e; margin: 0;">
              <strong>Security Notice:</strong> This link expires in 24 hours. If you didn't request this sign-in link, you can safely ignore this email. Your account remains secure.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
              Soulmate Compatibility | <a href="https://soulmates.syncscript.app" style="color: #8b5cf6; text-decoration: none;">Visit Website</a>
            </p>
            <p style="font-size: 11px; color: #9ca3af; margin: 5px 0;">
              This is an automated email from Soulmate Compatibility. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Sign In to Soulmate Compatibility - Secure Link',
    html,
  });
}

