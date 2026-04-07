"use client";

import { useParams, useRouter } from "next/navigation";
import { ScholarDetailResponsiveScreen } from "@sd/feature-catalog";
import { routes } from "@sd/core-contracts";

export default function ScholarDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  return (
    <ScholarDetailResponsiveScreen
      slug={params.slug}
      onNavigateToCollection={(id) => router.push(routes.collections.detail(id))}
      onNavigateToSeries={(id) => router.push(routes.series.detail(id))}
    />
  );
}
