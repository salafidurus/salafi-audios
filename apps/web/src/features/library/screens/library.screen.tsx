import type { Metadata } from "next";
import { EmptyState } from "@/features/library/components/states/empty-state/empty-state";
import { Shell } from "@/features/library/components/layout/shell/shell";
import { canonical } from "@/features/library/utils/seo";

export function getLibraryMetadata(): Metadata {
  return {
    title: "Library",
    description: "Your personal listening library and progress.",
    alternates: {
      canonical: canonical("/library"),
    },
  };
}

export function LibraryScreen() {
  return (
    <Shell title="Library" subtitle="Sign in required">
      <EmptyState message="Sign in to view your progress, saved lessons, and downloads." />
    </Shell>
  );
}
