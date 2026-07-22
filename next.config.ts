import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/committees/[id]/report": ["./assets/fonts/NotoSansCJKkr-Regular.otf"],
  },
};

export default nextConfig;
