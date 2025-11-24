/**
 * Next.js API Route for Partner Usage Stats
 * Proxies requests to backend API
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partner_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!partnerId) {
      return NextResponse.json(
        { error: 'partner_id is required' },
        { status: 400 }
      );
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);

    // Forward to backend API
    const response = await fetch(
      `${BACKEND_URL}/api/v1/partners/${partnerId}/usage?${queryParams.toString()}`,
      {
        headers: {
          'X-API-Key': request.headers.get('X-API-Key') || '',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch usage stats' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

