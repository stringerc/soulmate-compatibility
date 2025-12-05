/**
 * Email Sequence Management
 * Handles scheduling and sending of onboarding emails
 */

import { Resend } from "resend";
import {
  getWelcomeEmail,
  getTestCompletionReminderEmail,
  getResultsAccessEmail,
  getEngagementEmail,
  getReengagementEmail,
} from "./emailTemplates";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 
                 process.env.FROM_EMAIL || 
                 'onboarding@resend.dev';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Send email via Resend
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!resend) {
    console.warn("Resend not configured, email not sent");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: `Soulmate Compatibility <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    });

    if (result.data?.id) {
      return { success: true, messageId: result.data.id };
    } else {
      return { success: false, error: result.error?.message || "Unknown error" };
    }
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}

/**
 * Send welcome email when user signs up
 */
export async function sendWelcomeEmail(
  email: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = getWelcomeEmail(userName);
  return sendEmail(email, template.subject, template.html, template.text);
}

/**
 * Send test completion reminder (when user completes test but hasn't authenticated)
 */
export async function sendTestCompletionReminder(
  email: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = getTestCompletionReminderEmail(userName);
  return sendEmail(email, template.subject, template.html, template.text);
}

/**
 * Send results access email (when user authenticates after test)
 */
export async function sendResultsAccessEmail(
  email: string,
  userName?: string,
  archetype?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = getResultsAccessEmail(userName, archetype);
  return sendEmail(email, template.subject, template.html, template.text);
}

/**
 * Send engagement email (3 days after signup if no exploration)
 */
export async function sendEngagementEmail(
  email: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = getEngagementEmail(userName);
  return sendEmail(email, template.subject, template.html, template.text);
}

/**
 * Send re-engagement email (7 days after last activity)
 */
export async function sendReengagementEmail(
  email: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const template = getReengagementEmail(userName);
  return sendEmail(email, template.subject, template.html, template.text);
}

/**
 * Track email sent (store in localStorage for now, in production use database)
 */
export function trackEmailSent(email: string, emailType: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `soulmates_email_${emailType}_${email}`;
    localStorage.setItem(key, Date.now().toString());
  } catch (e) {
    console.error("Failed to track email:", e);
  }
}

/**
 * Check if email was already sent (prevent duplicates)
 */
export function wasEmailSent(email: string, emailType: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const key = `soulmates_email_${emailType}_${email}`;
    return !!localStorage.getItem(key);
  } catch (e) {
    return false;
  }
}

