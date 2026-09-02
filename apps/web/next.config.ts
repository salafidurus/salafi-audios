import type { NextConfig } from "next";

import path from "node:path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "preview-cdn.salafidurus.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.salafidurus.com",
        pathname: "/**",
      },
    ],
  },
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
};

export default nextConfig;
