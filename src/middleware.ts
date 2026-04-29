import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Use NextAuth middleware which triggers the 'authorized' callback in auth.config.ts
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Apply middleware to admin routes
  matcher: ['/admin', '/admin/:path*'],
};

