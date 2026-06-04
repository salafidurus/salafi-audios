import nextConfig from "@sd/util-config/eslint/next";

const config = [
  ...nextConfig,
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
