import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { savedResults } from '@/lib/savedResults';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Force dynamic rendering - this route uses request.headers
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: { email: string; iat: number };
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { email: string; iat: number };
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // In production, fetch from PostgreSQL database
    // For now, return from memory store
    const userId = decoded.email;
    const results = savedResults.get(userId) || [];

    return NextResponse.json({
      success: true,
      results: results.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error) {
    console.error('List results error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

