import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  // In Next.js 15+, we might need this for the proxy
  serverExternalPackages: [],
};

export default nextConfig;
