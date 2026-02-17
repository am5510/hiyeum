import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-1f3142c549b340048960e5ba85b68bfe.r2.dev",
      },
    ],
  },
};

export default nextConfig;
