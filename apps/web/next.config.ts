import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sd/core-api"],
  async headers() {
    return [
      {
        source: "/auth/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
