/**
 * Email Templates for Soulmates Onboarding Sequence
 * Branded templates with pink/purple gradient theme
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Base email template wrapper
 */
function getBaseTemplate(content: string, ctaText?: string, ctaUrl?: string): EmailTemplate {
  const ctaButton = ctaText && ctaUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">${ctaText}</a>
    </div>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Soulmate Compatibility</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✨ Soulmate Compatibility</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          ${content}
          ${ctaButton}
          <p style="font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Questions? Reply to this email or visit <a href="https://soulmates.syncscript.app" style="color: #ec4899;">soulmates.syncscript.app</a>
          </p>
        </div>
      </body>
    </html>
  `;

  // Generate plain text version
  const textContent = content.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n\n');
  const text = `Soulmate Compatibility\n\n${textContent}${ctaText && ctaUrl ? `\n\n${ctaText}: ${ctaUrl}` : ''}\n\nQuestions? Visit https://soulmates.syncscript.app`;

  return { html, text, subject: '' }; // Subject will be set by caller
}

/**
 * Welcome Email - Sent when user signs up
 */
export function getWelcomeEmail(userName?: string): EmailTemplate {
  const name = userName ? ` ${userName}` : '';
  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${name}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Welcome to Soulmate Compatibility! 🎉 We're thrilled to have you join our community of people discovering deeper connections through compatibility insights.
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>What's next?</strong>
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">Take our interactive StoryQuest test to discover your compatibility archetype</li>
      <li style="margin-bottom: 10px;">Explore how you connect with different personality types</li>
      <li style="margin-bottom: 10px;">Track your relationship journey and growth</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Ready to begin? Your journey starts with understanding yourself first.
    </p>
  `;

  const template = getBaseTemplate(content, "Start Your Compatibility Journey", "https://soulmates.syncscript.app/onboarding");
  template.subject = "Welcome to Soulmate Compatibility! ✨";
  return template;
}

/**
 * Test Completion Reminder - Sent when user completes test but hasn't authenticated
 */
export function getTestCompletionReminderEmail(userName?: string): EmailTemplate {
  const name = userName ? ` ${userName}` : '';
  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${name}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Great news! 🎉 You've completed your compatibility test, and your results are ready to view.
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>Your results include:</strong>
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">✨ Your unique compatibility archetype</li>
      <li style="margin-bottom: 10px;">💝 Your attachment style and love languages</li>
      <li style="margin-bottom: 10px;">📊 Detailed compatibility breakdowns</li>
      <li style="margin-bottom: 10px;">🔮 Insights for deeper relationships</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Sign in now to unlock your complete results and save them to your account. Your test data is saved for 7 days, so don't miss out!
    </p>
  `;

  const template = getBaseTemplate(content, "View Your Results", "https://soulmates.syncscript.app/login?callbackUrl=" + encodeURIComponent("/onboarding?showResults=true"));
  template.subject = "Your Compatibility Results Are Ready! 🎉";
  return template;
}

/**
 * Results Access Email - Sent when user authenticates after test
 */
export function getResultsAccessEmail(userName?: string, archetype?: string): EmailTemplate {
  const name = userName ? ` ${userName}` : '';
  const archetypeText = archetype ? ` You're a <strong>${archetype}</strong>!` : '';
  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${name}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Welcome back! 🎉 Your compatibility profile has been saved to your account.${archetypeText}
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>What you can do now:</strong>
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">📊 View your complete compatibility profile</li>
      <li style="margin-bottom: 10px;">🔍 Explore compatibility with different archetypes</li>
      <li style="margin-bottom: 10px;">💑 Try Couple Mode with a partner</li>
      <li style="margin-bottom: 10px;">📝 Track your relationship journey</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your data is now safely stored and accessible from any device. Start exploring!
    </p>
  `;

  const template = getBaseTemplate(content, "Go to Dashboard", "https://soulmates.syncscript.app/me");
  template.subject = "Your Profile is Ready! ✨";
  return template;
}

/**
 * Engagement Email - Sent 3 days after signup if user hasn't explored
 */
export function getEngagementEmail(userName?: string): EmailTemplate {
  const name = userName ? ` ${userName}` : '';
  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${name}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      We noticed you haven't explored the Compatibility Explorer yet. There's so much waiting for you!
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>Discover:</strong>
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">🔍 How compatible you are with 8 different archetypal profiles</li>
      <li style="margin-bottom: 10px;">💡 Insights into relationship dynamics</li>
      <li style="margin-bottom: 10px;">📈 Detailed compatibility breakdowns</li>
      <li style="margin-bottom: 10px;">🎯 Personalized recommendations</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Each exploration reveals new insights about yourself and your relationships. Start your journey today!
    </p>
  `;

  const template = getBaseTemplate(content, "Explore Compatibility", "https://soulmates.syncscript.app/explore");
  template.subject = "Discover Your Compatibility Matches 🔍";
  return template;
}

/**
 * Re-engagement Email - Sent 7 days after last activity
 */
export function getReengagementEmail(userName?: string): EmailTemplate {
  const name = userName ? ` ${userName}` : '';
  const content = `
    <p style="font-size: 16px; margin-bottom: 20px;">Hello${name}!</p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      We miss you! 💜 It's been a while since you've visited Soulmate Compatibility.
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Relationships evolve, and so do you. Consider retaking the test to see how your compatibility profile has changed, or explore new features we've added:
    </p>
    <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
      <li style="margin-bottom: 10px;">💑 Couple Mode - Deep compatibility analysis with a partner</li>
      <li style="margin-bottom: 10px;">🔬 Resonance Lab - Track relationship dynamics over time</li>
      <li style="margin-bottom: 10px;">📝 Soul Journey - Journal your relationship insights</li>
    </ul>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your journey of self-discovery continues. Come back and explore!
    </p>
  `;

  const template = getBaseTemplate(content, "Return to Dashboard", "https://soulmates.syncscript.app/me");
  template.subject = "We Miss You! 💜";
  return template;
}

