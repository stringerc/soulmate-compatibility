import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { savedResults } from '@/lib/savedResults';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Force dynamic rendering - this route uses request.headers and request.json()
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded: { email: string; iat: number };
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { email: string; iat: number };
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { person1Data, person2Data, compatibilityScore } = await request.json();

    // In production, save to PostgreSQL database
    // For now, store in memory
    const userId = decoded.email; // Use email as user ID for now
    const userResults = savedResults.get(userId) || [];
    
    const result = {
      id: crypto.randomUUID(),
      person1Data,
      person2Data,
      compatibilityScore,
      createdAt: new Date().toISOString(),
    };

    userResults.push(result);
    savedResults.set(userId, userResults);

    return NextResponse.json({
      success: true,
      resultId: result.id,
      message: 'Results saved successfully',
    });
  } catch (error) {
    console.error('Save results error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save results' },
      { status: 500 }
    );
  }
}

