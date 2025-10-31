import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    // Enable filesystem caching for faster dev server restarts (Next.js 16)
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
