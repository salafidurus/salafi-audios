import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  transpilePackages: ["@sd/ui-mobile"],
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
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".cjs",
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
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
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".cjs",
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ".native.tsx",
      ".native.ts",
      ".native.jsx",
      ".native.js",
    ],
  },
};

export default nextConfig;
