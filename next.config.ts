import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  experimental: {
    // Allow large payloads for cart orders with many items and base64 images if any
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://localhost:4000/uploads/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
