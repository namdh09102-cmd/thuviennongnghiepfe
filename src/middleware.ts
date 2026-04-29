import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminMiddleware } from './middleware/adminMiddleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    return adminMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

