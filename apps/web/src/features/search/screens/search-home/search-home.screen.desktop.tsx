"use client";

import { QuickBrowseDesktop } from "@/features/search/components/QuickBrowse/QuickBrowse.desktop";
import { SearchButtonDesktop } from "@/features/search/components/SearchButton/SearchButton.desktop";
import { TitleTextDesktop } from "@/features/search/components/TitleText/TitleText.desktop";
import { useQuickBrowse } from "@sd/domain-search";

export type SearchHomeDesktopScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
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
    <section className="flex flex-1 items-center justify-center px-[var(--space-layout-page-x)] py-[var(--space-layout-page-y)]">
      <section className="flex w-full max-w-[56rem] flex-col items-center gap-[var(--space-scale-4xl)] text-center">
        <div className="flex w-full max-w-[44rem] flex-col items-center gap-[var(--space-component-gap-lg)]">
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
    </section>
  );
}
