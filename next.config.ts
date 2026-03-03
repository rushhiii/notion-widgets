import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
};

export default nextConfig;
