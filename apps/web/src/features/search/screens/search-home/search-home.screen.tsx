"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { QuickBrowseDesktop } from "@/features/search/components/QuickBrowse/QuickBrowse.desktop";
import { QuickBrowseMobile } from "@/features/search/components/QuickBrowse/QuickBrowse.mobile";
import { SearchButtonDesktop } from "@/features/search/components/SearchButton/SearchButton.desktop";
import { SearchButtonMobile } from "@/features/search/components/SearchButton/SearchButton.mobile";
import { TitleTextDesktop } from "@/features/search/components/TitleText/TitleText.desktop";
import { TitleTextMobile } from "@/features/search/components/TitleText/TitleText.mobile";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useQuickBrowse } from "@sd/domain-search";

import type { ListingFormat } from "@sd/core-contracts";
import styles from "./search-home.screen.module.css";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (id: string, kind: ListingFormat) => void;
  onContinueListening?: (lectureId: string) => void;
};

export function SearchHomeScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeScreenProps) {
  const isDesktop = useIsDesktop();
  const { data, isLoading } = useQuickBrowse();

  if (isDesktop) {
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

  return (
    <ScreenView center>
      <div className={styles.content}>
        <div className={styles.searchGroup}>
          <div className={styles.header}>
            <TitleTextMobile>Find a lesson</TitleTextMobile>
          </div>
          <SearchButtonMobile placeholder="What do you want to listen to?" onPress={onOpenSearch} />
        </div>
        <QuickBrowseMobile
          isLoading={isLoading}
          scholars={data?.scholars}
          suggestions={data?.suggestions}
          recentProgress={data?.recentProgress}
          onSelectScholar={onSelectScholar}
          onSelectSuggestion={onSelectSuggestion}
          onContinueListening={onContinueListening}
          onSelectCategory={onSelectCategory}
        />
      </div>
    </ScreenView>
  );
}
