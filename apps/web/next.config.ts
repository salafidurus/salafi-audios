import type { NextConfig } from "next";

import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  transpilePackages: [
    "@sd/core-api",
    "@sd/core-contracts",
    "@sd/core-i18n",
    "@sd/design-tokens",
    "@sd/domain-account",
    "@sd/domain-audio",
    "@sd/domain-content",
    "@sd/domain-search",
    "@sd/utils-error",
  ],
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
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:4000/api/auth/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/:path*",
      },
    ];
  },
};

export default nextConfig;
