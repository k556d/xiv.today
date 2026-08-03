import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@xiv-today/next-request"],
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

export default nextConfig;
