import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  // output: "export", // Removed to enable middleware
  trailingSlash: true,
  poweredByHeader: false,
};

export default nextConfig;
