import type { NextConfig } from "next";
// import path from "path";
// import { validateEnv } from "./src/core/config/env";

// Fail fast if required environment variables are missing or invalid
// if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {
//   validateEnv();
// }

const nextConfig: NextConfig = {
  transpilePackages: ["@sd/core-api"],
  // outputFileTracingRoot: path.join(__dirname, "../../"),
  // turbopack: {
  //   root: path.join(__dirname, "../../"),
  // },
};

export default nextConfig;
