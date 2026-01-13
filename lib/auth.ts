import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user?.passwordHash) return null;

        const isValid = await compare(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const typedUser = user as typeof user & {
          role?: string;
          entitlement?: string;
          accessWeeks?: number;
          onboardingCompleted?: boolean;
        };
        token.id = user.id;
        token.role = typedUser.role ?? "USER";
        token.entitlement = typedUser.entitlement ?? "FREE";
        token.accessWeeks = typedUser.accessWeeks ?? 1;
        token.onboardingCompleted = typedUser.onboardingCompleted ?? false;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (trigger === "update" && token.id) {
        const refreshed = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            entitlement: true,
            accessWeeks: true,
            onboardingCompleted: true,
          },
        });
        if (refreshed) {
          token.role = refreshed.role;
          token.entitlement = refreshed.entitlement;
          token.accessWeeks = refreshed.accessWeeks;
          token.onboardingCompleted = refreshed.onboardingCompleted;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SUPERADMIN" | "USER";
        session.user.entitlement = token.entitlement as
          | "FREE"
          | "PAID"
          | "COMPED";
        session.user.accessWeeks = token.accessWeeks as number;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.email) return true;
      const adminEmail = process.env.SUPERADMIN_EMAIL?.toLowerCase();
      if (adminEmail && user.email.toLowerCase() === adminEmail) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "SUPERADMIN" },
        });
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      const adminEmail = process.env.SUPERADMIN_EMAIL?.toLowerCase();
      if (adminEmail && user.email?.toLowerCase() === adminEmail) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "SUPERADMIN" },
        });
      }
    },
  },
};
