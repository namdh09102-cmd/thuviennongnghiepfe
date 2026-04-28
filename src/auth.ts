import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import authConfig from "./auth.config";

export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: { strategy: "jwt" },
  ...authConfig,
});
