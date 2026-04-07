"use client";

import { useParams, useRouter } from "next/navigation";
import { CollectionDetailResponsiveScreen } from "@sd/feature-catalog";
import { routes } from "@sd/core-contracts";

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <CollectionDetailResponsiveScreen
      id={params.id}
      onNavigateToSeries={(id) => router.push(routes.series.detail(id))}
    />
  );
}
