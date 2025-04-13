// auth.ts (in root directory)
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

interface Credentials {
  email: string;
  password: string;
}

export const config = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        console.log('Auth attempt:', { email: credentials?.email });

        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          const { email, password } = credentials as Credentials;

          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          console.log('Found user:', user);

          if (!user) {
            console.log('User not found:', email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return null;
          }

          console.log('Authentication successful for user:', email);
          
          // Return a standardized user object
          const authUser: User = {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
          };
          
          console.log('Returning auth user:', authUser);
          return authUser;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      console.log('JWT Callback - Trigger:', trigger || 'token refresh');
      
      if (trigger === 'signIn' && user) {
        // Initial sign-in
        console.log('Initial sign-in, updating token with user data:', user);
        return {
          ...token,
          id: user.id,
        };
      }

      if (trigger === 'update') {
        // Handle token updates
        console.log('Token update triggered');
        return { ...token };
      }

      // Token refresh/validation (no trigger, just return existing token)
      console.log('Token refresh/validation - using existing token');
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback:', { 
        sessionUser: session?.user, 
        tokenId: token?.id
      });

      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: true, // Enable debug messages
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);