import NextAuth from "next-auth";
import authConfig from "./auth.config";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectMongoDB();
        
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await User.findOne({ email });
        if (!user || !user.password) {
          return null;
        }

        // Hash password using email as salt
        const hashedPassword = crypto.scryptSync(password, email, 64).toString('hex');

        if (user.password !== hashedPassword) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
          image: user.image || user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectMongoDB();
          let dbUser = await User.findOne({ email: user.email });
          
          if (!dbUser) {
            // Create new user if not exists
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              username: (user.email ? user.email.split('@')[0] : 'user') + Math.floor(Math.random() * 1000),
              role: 'user',
              avatar: user.image,
            });
          }
          
          user.id = dbUser._id.toString();
          (user as any).role = dbUser.role;
          (user as any).username = dbUser.username;
        } catch (error) {
          console.error('Error in Google signIn callback:', error);
          return false;
        }
      }
      return true;
    },
  },
});
