"use client";

import { useParams } from "next/navigation";
import { SeriesDetailResponsiveScreen } from "@sd/feature-catalog";

export default function SeriesDetailPage() {
  const params = useParams<{ id: string }>();

  return <SeriesDetailResponsiveScreen id={params.id} />;
}
