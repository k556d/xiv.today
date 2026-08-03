import { execSync } from "node:child_process";

if (process.env.VERCEL_ENV === "production") {
  execSync("pnpm exec drizzle-kit migrate", { stdio: "inherit" });
}

execSync("pnpm exec next build", { stdio: "inherit" });
