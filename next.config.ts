import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    // Enable filesystem caching for faster dev server restarts (Next.js 16)
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ft0hi8q8c3.ufs.sh",
        port: "",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
