import "next-auth";
import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SUPERADMIN" | "USER";
      entitlement: "FREE" | "PAID" | "COMPED";
      accessWeeks: number;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: "SUPERADMIN" | "USER";
    entitlement: "FREE" | "PAID" | "COMPED";
    accessWeeks: number;
    onboardingCompleted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "SUPERADMIN" | "USER";
    entitlement?: "FREE" | "PAID" | "COMPED";
    accessWeeks?: number;
    onboardingCompleted?: boolean;
  }
}
