import { NextResponse } from 'next/server';

// Prevent static export of API routes
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Try to get IP from various headers (for proxy/CDN scenarios)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
    
    let ip = null;
    
    // Priority order: CF-Connecting-IP > X-Real-IP > X-Forwarded-For > fallback
    if (cfConnectingIp) {
      ip = cfConnectingIp;
    } else if (realIp) {
      ip = realIp;
    } else if (forwarded) {
      // X-Forwarded-For can be a comma-separated list, get the first one
      ip = forwarded.split(',')[0].trim();
    } else {
      // Fallback for local development
      ip = request.headers.get('host')?.includes('localhost') 
        ? '127.0.0.1' 
        : 'unknown';
    }
    
    return NextResponse.json({ 
      ip,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error detecting IP:', error);
    return NextResponse.json(
      { error: 'Failed to detect IP address', ip: 'unknown' },
      { status: 500 }
    );
  }
}
