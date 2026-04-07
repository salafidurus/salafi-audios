"use client";

import { QuickBrowseDesktopWeb } from "../../components/QuickBrowse/QuickBrowse.desktop.web";
import { SearchButtonDesktopWeb } from "../../components/SearchButton/SearchButton.desktop.web";
import { TitleTextDesktopWeb } from "../../components/TitleText/TitleText.desktop.web";
import { useQuickBrowse } from "../../hooks/use-quickbrowse";

export type SearchHomeDesktopWebScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
};

export function SearchHomeDesktopWebScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeDesktopWebScreenProps) {
  const { data } = useQuickBrowse();

  return (
    <section className="flex flex-1 items-center justify-center px-[var(--space-layout-page-x)] py-[var(--space-layout-page-y)]">
      <section className="flex w-full max-w-[56rem] flex-col items-center gap-[var(--space-scale-4xl)] text-center">
        <div className="flex w-full max-w-[44rem] flex-col items-center gap-[var(--space-component-gap-lg)]">
          <TitleTextDesktopWeb>Find a lesson</TitleTextDesktopWeb>
          <SearchButtonDesktopWeb label="What do you want to listen to?" onClick={onOpenSearch} />
        </div>
        <QuickBrowseDesktopWeb
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
