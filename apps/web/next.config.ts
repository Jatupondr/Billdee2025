import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,
  // Temporarily disable reactCompiler to fix Docker build
  // reactCompiler: true,
  output: "standalone", // Required for Docker deployment
  // Allow loading images from any https host (for Google and others)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
