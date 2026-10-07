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
        hostname: "res.cloudinary.com",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    // Keep the client bundle lean — three.js is already split via
    // dynamic import() in SiteFx, this trims anything that slips through.
    optimizePackageImports: ["three", "gsap"],
  },
};

export default nextConfig;
