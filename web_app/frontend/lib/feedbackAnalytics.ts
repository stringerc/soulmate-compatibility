/**
 * Feedback Analytics Utilities
 * Tracks and analyzes user feedback for insights
 */

export interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  feedbackByType: Record<string, number>;
  feedbackByPage: Record<string, number>;
  recentFeedback: Array<{
    type: string;
    rating: number | null;
    message: string;
    timestamp: string;
  }>;
}

/**
 * Track feedback event (for analytics)
 */
export function trackFeedbackEvent(
  type: 'general' | 'bug' | 'feature' | 'compliment',
  rating: number | null,
  context?: {
    page?: string;
    step?: string;
  }
) {
  // Integrate with analytics service (e.g., Google Analytics, Mixpanel)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'feedback_submitted', {
      feedback_type: type,
      rating: rating,
      page: context?.page,
      step: context?.step,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Feedback event:', { type, rating, context });
  }
}

/**
 * Calculate feedback metrics from data
 */
export function calculateMetrics(feedbackData: Array<any>): FeedbackMetrics {
  const totalFeedback = feedbackData.length;
  
  const ratings = feedbackData
    .map(f => f.rating)
    .filter((r): r is number => r !== null && r !== undefined);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  const feedbackByType: Record<string, number> = {};
  const feedbackByPage: Record<string, number> = {};

  feedbackData.forEach(feedback => {
    feedbackByType[feedback.type] = (feedbackByType[feedback.type] || 0) + 1;
    const page = feedback.context?.page || 'unknown';
    feedbackByPage[page] = (feedbackByPage[page] || 0) + 1;
  });

  const recentFeedback = feedbackData
    .slice(-10)
    .map(f => ({
      type: f.type,
      rating: f.rating,
      message: f.message.substring(0, 100),
      timestamp: f.context?.timestamp || new Date().toISOString(),
    }))
    .reverse();

  return {
    totalFeedback,
    averageRating: Math.round(averageRating * 10) / 10,
    feedbackByType,
    feedbackByPage,
    recentFeedback,
  };
}

/**
 * Get feedback summary for dashboard
 */
export async function getFeedbackSummary(): Promise<FeedbackMetrics | null> {
  try {
    // In production, fetch from your backend API
    // const response = await fetch('/api/feedback/summary');
    // return await response.json();
    
    // For now, return null (will be implemented with backend)
    return null;
  } catch (error) {
    console.error('Error fetching feedback summary:', error);
    return null;
  }
}

