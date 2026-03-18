"use client";

import { SearchButton } from "@/features/search/components/search-button";
import { TitleText } from "@/features/search/components/title-text";

export function SearchHomeDesktopScreen() {
  return (
    <main className="flex flex-1 items-center justify-center px-[var(--space-layout-page-x)] py-[var(--space-layout-page-y)]">
      <section className="flex w-full max-w-[44rem] flex-col items-center gap-[var(--space-component-gap-lg)] text-center">
        <TitleText>Find a lesson</TitleText>
        <SearchButton href="/searchprocessing" label="What do you want to listen to?" size="lg" />
      </section>
    </main>
  );
}
