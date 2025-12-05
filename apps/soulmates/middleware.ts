import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // ALWAYS block Vercel Analytics injection
  // Remove any Vercel analytics headers
  response.headers.delete('x-vercel-analytics');
  response.headers.delete('x-vercel-analytics-id');
  response.headers.delete('x-vercel-speed-insights');
  
  // Set header to signal analytics is disabled
  response.headers.set('X-Vercel-Analytics', 'disabled');
  
  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|suppress-console.js).*)',
};

