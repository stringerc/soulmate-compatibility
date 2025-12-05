import { NextRequest, NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendTestCompletionReminder,
  sendResultsAccessEmail,
  sendEngagementEmail,
  sendReengagementEmail,
} from "@/lib/emailSequence";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, emailType, userName, archetype } = body;

    // Validate email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { detail: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Validate email type
    const validTypes = [
      'welcome',
      'test_completion_reminder',
      'results_access',
      'engagement',
      'reengagement',
    ];

    if (!emailType || !validTypes.includes(emailType)) {
      return NextResponse.json(
        { detail: `Valid emailType required. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let result;

    // Send appropriate email based on type
    switch (emailType) {
      case 'welcome':
        result = await sendWelcomeEmail(normalizedEmail, userName);
        break;
      case 'test_completion_reminder':
        result = await sendTestCompletionReminder(normalizedEmail, userName);
        break;
      case 'results_access':
        result = await sendResultsAccessEmail(normalizedEmail, userName, archetype);
        break;
      case 'engagement':
        result = await sendEngagementEmail(normalizedEmail, userName);
        break;
      case 'reengagement':
        result = await sendReengagementEmail(normalizedEmail, userName);
        break;
      default:
        return NextResponse.json(
          { detail: "Invalid email type" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        {
          detail: result.error || "Failed to send email",
          error: "Email sending failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        detail: error instanceof Error ? error.message : "An unexpected error occurred",
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

