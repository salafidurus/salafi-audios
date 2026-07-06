import type { MetadataRoute } from "next";

const DISALLOW_PATHS = [
  "/admin",
  "/settings",
  "/sign-in",
  "/library",
  "/feed/following",
  "/auth",
] as const;

export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.NODE_ENV === "production" &&
    (process.env.VERCEL_ENV === undefined || process.env.VERCEL_ENV === "production");

  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...DISALLOW_PATHS],
    },
    sitemap: [`${baseUrl}/sitemap.xml`, `${apiUrl}/sitemap.xml`],
  };
}
