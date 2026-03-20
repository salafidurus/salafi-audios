import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@sd/shared",
    "@sd/core-api",
    "@sd/core-auth",
    "@sd/core-config",
    "@sd/core-styles",
    "@sd/feature-auth",
    "@sd/feature-search",
    "@sd/feature-navigation",
    "@sd/feature-library",
    "@sd/feature-live",
    "@sd/feature-feed",
    "@sd/feature-account",
    "@sd/feature-legal",
    "@sd/feature-support",
  ],
  webpack(config) {
    // Define React Native's __DEV__ global for webpack builds
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
      }),
    );

    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".desktop.web.tsx",
      ".desktop.web.ts",
      ".desktop.web.jsx",
      ".desktop.web.js",
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".cjs",
      ".native.tsx",
      ".native.ts",
      ".native.jsx",
      ".native.js",
      ...(config.resolve.extensions ?? []),
    ];

    return config;
  },
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
    resolveExtensions: [
      ".desktop.web.tsx",
      ".desktop.web.ts",
      ".desktop.web.jsx",
      ".desktop.web.js",
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".cjs",
      ".native.tsx",
      ".native.ts",
      ".native.jsx",
      ".native.js",
    ],
  },
};

export default nextConfig;
