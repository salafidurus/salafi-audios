import type { MetadataRoute } from "next";

/** Lists authenticated and administrative routes that search engines must not crawl. */
const DISALLOW_PATHS = ["/admin", "/settings", "/sign-in", "/my-library", "/auth"] as const;

/** Produces environment-aware crawler rules and links to the web and API sitemaps. */
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
