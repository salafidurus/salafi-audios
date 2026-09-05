import type { Metadata } from "next";

import { endpoints } from "@sd/core-contracts";
import { Suspense } from "react";

import ScholarDetailInner from "./scholar-detail-inner";

/** Documents this module's responsibility and public boundary. */
/** Resolves scholar metadata through the canonical versioned application API. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{
    /** Public scholar slug used by the API detail endpoint. */
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${apiBase}${endpoints.scholars.detail(slug)}`, {
      next: { revalidate: 3600 },
    });
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

/** Renders the scholar detail surface with a deferred content boundary. */
export default function ScholarPage() {
  return (
    <main className="flex flex-1 min-h-full flex-col">
      <Suspense fallback={null}>
        <ScholarDetailInner />
      </Suspense>
    </main>
  );
}
