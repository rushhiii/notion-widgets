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
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.vercel.app https://vercel.com",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
