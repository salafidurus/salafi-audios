"use client";

import { useParams } from "next/navigation";
import { ScholarDetailScreen } from "@/features/scholar/screens/scholar-detail/scholar-detail.screen";

export default function ScholarPage() {
  const params = useParams<{ slug: string }>();
  return (
    <main className="flex flex-1 min-h-full flex-col">
      <ScholarDetailScreen slug={params.slug} />
    </main>
  );
}
