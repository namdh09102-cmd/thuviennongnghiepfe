import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        // Trong thực tế, bạn sẽ gọi API backend của mình ở đây để xác thực
        // Ở đây chúng ta giả định login thành công nếu có email/password (vì đây là demo/mock)
        if (credentials?.email && credentials?.password) {
          // Trả về user object mock hoặc fetch từ Supabase/Backend
          return {
            id: "1",
            name: "Admin User",
            email: credentials.email as string,
            role: "ADMIN",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminPage = nextUrl.pathname.startsWith('/admin');
      
      if (isAdminPage) {
        if (isLoggedIn) {
          // Kiểm tra quyền admin/moderator
          const role = (auth.user as any).role;
          if (role === 'ADMIN' || role === 'MODERATOR') return true;
          return Response.redirect(new URL('/403', nextUrl));
        }
        return false; // Redirect to login
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
} satisfies NextAuthConfig;
