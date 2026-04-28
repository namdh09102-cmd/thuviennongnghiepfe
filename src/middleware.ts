import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect /admin routes and any other routes requiring auth
  matcher: ["/admin/:path*", "/profile/:path*"],
};
