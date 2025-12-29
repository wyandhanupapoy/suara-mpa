import { NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiters for different endpoints
const rateLimiters = {
  // General API requests - 60 requests per minute
  api: new RateLimiterMemory({
    points: 60,
    duration: 60,
  }),
  
  // Email sending - 3 requests per hour
  email: new RateLimiterMemory({
    points: 3,
    duration: 3600,
  }),
  
  // Form submissions - 10 requests per hour
  submission: new RateLimiterMemory({
    points: 10,
    duration: 3600,
  }),
};

// Get client IP address
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

// Rate limiting middleware
async function rateLimit(request, limiter) {
  const ip = getClientIP(request);
  
  try {
    await limiter.consume(ip);
    return null; // No error, proceed
  } catch (rejRes) {
    const retryAfter = Math.round(rejRes.msBeforeNext / 1000) || 1;
    return NextResponse.json(
      { 
        error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
        retryAfter,
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limiter.points.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
        }
      }
    );
  }
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  // Apply rate limiting based on path
  if (pathname.startsWith('/api/send-email')) {
    const rateLimitResponse = await rateLimit(request, rateLimiters.email);
    if (rateLimitResponse) return rateLimitResponse;
  } else if (pathname.startsWith('/api/check-cooldown')) {
    const rateLimitResponse = await rateLimit(request, rateLimiters.submission);
    if (rateLimitResponse) return rateLimitResponse;
  } else if (pathname.startsWith('/api/')) {
    const rateLimitResponse = await rateLimit(request, rateLimiters.api);
    if (rateLimitResponse) return rateLimitResponse;
  }
  
  // Add security headers (additional to next.config.mjs)
  const response = NextResponse.next();
  
  // CSRF protection - check origin for POST requests
  if (request.method === 'POST' && pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // Allow same-origin requests or requests without origin (mobile apps, etc)
    if (origin && !origin.includes(host)) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }
  }
  
  return response;
}

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    '/api/:path*',
  ],
};
