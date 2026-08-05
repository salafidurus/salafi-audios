import type { Metadata } from "next";

import { Suspense } from "react";

import ScholarDetailInner from "./scholar-detail-inner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${apiBase}/scholars/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    const scholar = await res.json();
    return {
      title: scholar.name,
      description: `Browse lectures and durus by ${scholar.name}.`,
    };
  } catch {
    return {
      title: "Scholar",
      description: "View scholar profile and durus",
    };
  }
}

export default function ScholarPage() {
  return (
    <main className="flex flex-1 min-h-full flex-col">
      <Suspense fallback={null}>
        <ScholarDetailInner />
      </Suspense>
    </main>
  );
}
