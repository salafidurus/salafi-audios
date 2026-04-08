"use client";

import { useParams } from "next/navigation";
import { ScholarDetailResponsiveScreen } from "../../../../features/scholar/screens/scholar-detail/scholar-detail.screen";

export default function ScholarPage() {
  const params = useParams<{ slug: string }>();
  return <ScholarDetailResponsiveScreen slug={params.slug} />;
}
