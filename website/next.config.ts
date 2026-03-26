import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "s3.example.com",
      },
      {
        protocol: "https",
        hostname: "smp-ad-catalog.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
