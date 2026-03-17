"use client";

import { useRouter } from "next/navigation";
import { SearchHomeScreen } from "@sd/ui-mobile";
import { SearchButton } from "@/features/search/components/search-button";
import { useResponsive } from "@/shared/hooks/use-responsive";

export function SearchLandingScreen() {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    return (
      <SearchHomeScreen
        onOpenSearch={() => router.push("/searchprocessing")}
        onSelectCategory={(searchKey) =>
          router.push(`/searchprocessing?searchKey=${encodeURIComponent(searchKey)}`)
        }
      />
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-[var(--space-layout-page-x)] py-[var(--space-layout-page-y)]">
      <section className="flex w-full max-w-[44rem] flex-col items-center gap-[var(--space-component-gap-lg)] text-center">
        <p
          className="text-[var(--content-strong)]"
          style={{
            fontFamily: "var(--typo-display-md-font-family)",
            fontSize: "var(--typo-display-md-font-size)",
            lineHeight: "var(--typo-display-md-line-height)",
            letterSpacing: "var(--typo-display-md-letter-spacing)",
            fontWeight: "var(--typo-display-md-font-weight)",
          }}
        >
          Find a lesson
        </p>
        <SearchButton href="/searchprocessing" label="What do you want to listen to?" size="lg" />
      </section>
    </main>
  );
}
