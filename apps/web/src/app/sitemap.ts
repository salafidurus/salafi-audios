import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.NODE_ENV !== "production") {
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/explore/recent`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/live/scheduled`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/live/ended`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/scholars`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];
}
