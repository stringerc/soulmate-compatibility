import { NextRequest, NextResponse } from 'next/server';

interface FeedbackData {
  type: 'general' | 'bug' | 'feature' | 'compliment';
  rating: number | null;
  message: string;
  email?: string;
  context: {
    page: string;
    step?: string;
    compatibilityScore?: number;
    userAgent: string;
    timestamp: string;
    url: string;
  };
}

// Force dynamic rendering - this route uses request.json() and request.headers
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data: FeedbackData = await request.json();

    // Validate required fields
    if (!data.message || !data.type) {
      return NextResponse.json(
        { error: 'Message and type are required' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Save to database (e.g., PostgreSQL, MongoDB)
    // 2. Send to analytics service (e.g., Mixpanel, Amplitude)
    // 3. Send email notification for critical bugs
    // 4. Store in feedback management system (e.g., Canny, UserVoice)

    // For now, we'll log and return success
    // You can integrate with your backend API here
    console.log('Feedback received:', {
      type: data.type,
      rating: data.rating,
      message: data.message.substring(0, 100),
      page: data.context.page,
      timestamp: data.context.timestamp,
    });

    // Example: Send to external API
    // const backendUrl = process.env.BACKEND_URL || 'https://soulmate-api.onrender.com';
    // await fetch(`${backendUrl}/api/feedback`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });

    return NextResponse.json(
      { success: true, message: 'Feedback received successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve feedback (admin only)
export async function GET(request: NextRequest) {
  // In production, add authentication/authorization
  // const authHeader = request.headers.get('authorization');
  // if (!isAuthorized(authHeader)) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  // Return feedback summary or list
  return NextResponse.json({
    message: 'Feedback endpoint - use POST to submit feedback',
    // In production, return actual feedback data from database
  });
}

