"use client";

import { QuickBrowseDesktop } from "@/features/search/components/QuickBrowse/QuickBrowse.desktop";
import { SearchButtonDesktop } from "@/features/search/components/SearchButton/SearchButton.desktop";
import { TitleTextDesktop } from "@/features/search/components/TitleText/TitleText.desktop";
import { useQuickBrowse } from "@sd/domain-search";

import type { ListingFormat } from "@sd/core-contracts";
import styles from "./search-home.screen.module.css";

export type SearchHomeDesktopScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (id: string, kind: ListingFormat) => void;
  onContinueListening?: (lectureId: string) => void;
};

export function SearchHomeDesktopScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeDesktopScreenProps) {
  const { data, isLoading } = useQuickBrowse();

  return (
    <main className={styles.main}>
      <section className={styles.content}>
        <div className="flex w-full flex-col items-center gap-[var(--space-component-gap-lg)]">
          <TitleTextDesktop>Find a lesson</TitleTextDesktop>
          <SearchButtonDesktop label="What do you want to listen to?" onClick={onOpenSearch} />
        </div>
        <QuickBrowseDesktop
          isLoading={isLoading}
          scholars={data?.scholars}
          suggestions={data?.suggestions}
          recentProgress={data?.recentProgress}
          onSelectScholar={onSelectScholar}
          onSelectSuggestion={onSelectSuggestion}
          onContinueListening={onContinueListening}
          onSelectCategory={onSelectCategory}
        />
      </section>
    </main>
  );
}
