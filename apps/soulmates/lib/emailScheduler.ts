/**
 * Email Scheduler Utility
 * For scheduling delayed emails (engagement, re-engagement)
 * 
 * Note: In production, use a proper job queue (e.g., Bull, BullMQ, or Vercel Cron)
 * This is a client-side helper for tracking when emails should be sent
 */

/**
 * Schedule an email to be sent at a specific time
 * Stores in localStorage for now (in production, use database + job queue)
 */
export function scheduleEmail(
  email: string,
  emailType: string,
  sendAt: number, // Unix timestamp in milliseconds
  metadata?: { userName?: string; archetype?: string }
): void {
  if (typeof window === 'undefined') return;

  try {
    const key = 'soulmates_scheduled_emails';
    const scheduled = JSON.parse(localStorage.getItem(key) || '[]');
    
    scheduled.push({
      email,
      emailType,
      sendAt,
      metadata: metadata || {},
      createdAt: Date.now(),
    });

    localStorage.setItem(key, JSON.stringify(scheduled));
  } catch (e) {
    console.error('Failed to schedule email:', e);
  }
}

/**
 * Get scheduled emails that are ready to be sent
 */
export function getScheduledEmailsReadyToSend(): Array<{
  email: string;
  emailType: string;
  metadata: any;
}> {
  if (typeof window === 'undefined') return [];

  try {
    const key = 'soulmates_scheduled_emails';
    const scheduled = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();
    
    const ready = scheduled.filter((item: any) => item.sendAt <= now);
    
    // Remove ready emails from storage
    const remaining = scheduled.filter((item: any) => item.sendAt > now);
    localStorage.setItem(key, JSON.stringify(remaining));
    
    return ready.map((item: any) => ({
      email: item.email,
      emailType: item.emailType,
      metadata: item.metadata,
    }));
  } catch (e) {
    console.error('Failed to get scheduled emails:', e);
    return [];
  }
}

/**
 * Schedule engagement email (3 days after signup)
 */
export function scheduleEngagementEmail(email: string, userName?: string): void {
  const sendAt = Date.now() + (3 * 24 * 60 * 60 * 1000); // 3 days
  scheduleEmail(email, 'engagement', sendAt, { userName });
}

/**
 * Schedule re-engagement email (7 days after last activity)
 */
export function scheduleReengagementEmail(email: string, userName?: string): void {
  const sendAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
  scheduleEmail(email, 'reengagement', sendAt, { userName });
}

/**
 * Process scheduled emails (call this periodically or on page load)
 */
export async function processScheduledEmails(): Promise<void> {
  const ready = getScheduledEmailsReadyToSend();
  
  for (const item of ready) {
    try {
      const response = await fetch("/api/v1/soulmates/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: item.email,
          emailType: item.emailType,
          userName: item.metadata.userName,
          archetype: item.metadata.archetype,
        }),
      });

      if (!response.ok) {
        console.error(`Failed to send scheduled email ${item.emailType} to ${item.email}`);
      }
    } catch (e) {
      console.error(`Error sending scheduled email ${item.emailType} to ${item.email}:`, e);
    }
  }
}

/**
 * Initialize email scheduler (call on app load)
 */
export function initializeEmailScheduler(): void {
  if (typeof window === 'undefined') return;

  // Process scheduled emails on page load
  processScheduledEmails().catch(console.error);

  // Process scheduled emails every hour
  setInterval(() => {
    processScheduledEmails().catch(console.error);
  }, 60 * 60 * 1000); // 1 hour
}

