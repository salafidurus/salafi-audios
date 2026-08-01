import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
