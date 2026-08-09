"use client";

import { useParams } from "next/navigation";

import { ScholarDetailScreen } from "@/features/listing";

export default function ScholarDetailInner() {
  const params = useParams<{ slug: string }>();
  return <ScholarDetailScreen slug={params.slug} />;
}
