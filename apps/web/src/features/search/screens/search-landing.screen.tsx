import { SearchButton } from "@/features/search/components/search-button";

export function SearchLandingScreen() {
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
