import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.resolve(
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url)),
);

const nextConfig: NextConfig = {
  // Pin workspace root so Next.js does not walk up to unrelated lockfiles
  // (e.g. C:\Users\Administrator\package-lock.json).
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-574171c4de1f4094b5bcfb3b35270183.r2.dev",
      },
    ],
  },
};

export default nextConfig;
