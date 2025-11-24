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
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Magic Link - Soulmate Compatibility</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✨ Your Magic Link</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Click the button below to sign in to your Soulmate Compatibility account. This link expires in 24 hours.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Sign In to Your Account
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px;">
            ${magicLinkUrl}
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            This is an automated email. If you didn't request this magic link, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Your Magic Link - Soulmate Compatibility',
    html,
  });
}

