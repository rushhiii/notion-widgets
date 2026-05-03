import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // distDir: "build", // Removed for Vercel compatibility
  // output: "export", // Removed to enable middleware
  trailingSlash: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://vercel.com",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://vercel.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
