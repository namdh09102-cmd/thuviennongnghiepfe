import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Nếu đã ở trang login thì bỏ qua
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // 1. Check session/JWT token tồn tại
  const adminToken = request.cookies.get('admin_token')?.value;

  if (!adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key');
    // 2. Decode và check payload
    const { payload } = await jwtVerify(adminToken, secret);
    
    // 3. Check role === 'admin'
    if (payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Nếu token không hợp lệ hoặc hết hạn
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}
