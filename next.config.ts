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
  // NOTE: no `experimental.optimizePackageImports` for three/gsap here
  // on purpose. That transform rewrites module specifiers inside packages
  // with deep circular graphs (three.js internals, gsap core <-> plugin
  // subpaths); under Turbopack production scope-hoisting the rewritten
  // order can evaluate a binding before its declaration, crashing boot
  // with `ReferenceError: Cannot access 'v' before initialization` on
  // affected devices while working fine in dev. three.js is already
  // code-split via dynamic import() (SiteFx desktop FX + lazy
  // theme-liquid), so the flag buys nothing and only adds rewrite risk.
};

export default nextConfig;
