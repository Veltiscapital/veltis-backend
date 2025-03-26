import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Check if it's an OPTIONS request (preflight)
  if (request.method === 'OPTIONS') {
    // Create a new response with CORS headers
    const response = new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
    return response;
  }

  // For non-OPTIONS requests, add CORS headers to the response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add CORS headers to the response
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  return response;
}

// Configure the middleware to run only for API routes
export const config = {
  matcher: '/api/:path*',
};
