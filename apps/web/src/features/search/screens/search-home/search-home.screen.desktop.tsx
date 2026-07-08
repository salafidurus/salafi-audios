"use client";

import { QuickBrowseDesktop } from "@/features/search/components/QuickBrowse/QuickBrowse.desktop";
import { SearchButtonDesktop } from "@/features/search/components/SearchButton/SearchButton.desktop";
import { TitleTextDesktop } from "@/features/search/components/TitleText/TitleText.desktop";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useQuickBrowse } from "@sd/domain-search";

import type { ListingFormat } from "@sd/core-contracts";

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
    <ScreenView>
      <section className="flex flex-col items-center justify-center gap-[var(--space-scale-4xl)] text-center">
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
    </ScreenView>
  );
}
