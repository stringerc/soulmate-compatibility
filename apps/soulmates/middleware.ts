import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Block Vercel analytics if disabled
  if (process.env.DISABLE_VERCEL_ANALYTICS === 'true') {
    // Remove Vercel analytics headers
    response.headers.delete('x-vercel-analytics');
  }
  
  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|suppress-console.js).*)',
};

