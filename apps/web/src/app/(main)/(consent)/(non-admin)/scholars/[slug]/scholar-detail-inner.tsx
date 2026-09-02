/** Documents this module's responsibility and public boundary. */
"use client";

import { useParams } from "next/navigation";

import { ScholarDetailScreen } from "@/features/details";

export default function ScholarDetailInner() {
  const params = useParams<{ slug: string }>();
  return <ScholarDetailScreen slug={params.slug} />;
}
