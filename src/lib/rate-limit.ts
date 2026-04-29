import { NextResponse } from 'next/server';

const ipCache = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const cacheEntry = ipCache.get(ip);

  if (!cacheEntry) {
    ipCache.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (now > cacheEntry.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  cacheEntry.count += 1;

  if (cacheEntry.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - cacheEntry.count };
}

export function getIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return '127.0.0.1';
}
