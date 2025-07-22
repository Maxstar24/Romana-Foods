import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    role: string;
  }
} 