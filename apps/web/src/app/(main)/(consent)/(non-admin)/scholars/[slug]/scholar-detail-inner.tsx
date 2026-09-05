/** Documents this module's responsibility and public boundary. */
"use client";

import { useParams } from "next/navigation";

import { ScholarDetailScreen } from "@/features/details";

/** Resolves the route slug and passes it to the scholar detail data screen. */
export default function ScholarDetailInner() {
  /** Route identity used to load the public scholar detail. */
  const params = useParams<{
    /** Public scholar slug supplied by the dynamic route segment. */
    slug: string;
  }>();
  return <ScholarDetailScreen slug={params.slug} />;
}
