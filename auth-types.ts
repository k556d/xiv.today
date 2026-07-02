import type { DefaultSession } from "next-auth";

export {};

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id: string;
      username: string | null;
    };
  }

  interface User {
    username?: string | null;
  }
}
