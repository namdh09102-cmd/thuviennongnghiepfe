import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          // Trả về user thật từ database hoặc mock thông tin user thật
          return {
            id: "a817905e-5286-4d0b-af95-3688912dd902",
            name: "Người dùng Thử nghiệm",
            email: credentials.email as string,
            role: "expert",
            username: "testuser",
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
          const role = (auth.user as any).role;
          if (role === 'ADMIN' || role === 'MODERATOR' || role === 'expert') return true;
          return Response.redirect(new URL('/403', nextUrl));
        }
        return false; 
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
} satisfies NextAuthConfig;
