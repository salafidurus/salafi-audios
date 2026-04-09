"use client";

import { useParams } from "next/navigation";
import { ScholarDetailScreen } from "../../../../features/scholar/screens/scholar-detail/scholar-detail.screen";

export default function ScholarPage() {
  const params = useParams<{ slug: string }>();
  return <ScholarDetailScreen slug={params.slug} />;
}

