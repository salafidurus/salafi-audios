"use client";

import { useParams } from "next/navigation";
import { ScholarDetailResponsiveScreen } from "@sd/feature-scholar";

export default function ScholarPage() {
  const params = useParams<{ slug: string }>();
  return <ScholarDetailResponsiveScreen slug={params.slug} />;
}
