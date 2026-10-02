import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "pub-0b5dfbb7f1bd46be9741d4d704b92507.r2.dev",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
