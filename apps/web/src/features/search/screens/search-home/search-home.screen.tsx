"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { QuickBrowse } from "@/features/search/components/QuickBrowse/QuickBrowse";
import { SearchButton } from "@/features/search/components/SearchButton/SearchButton";
import { TitleText } from "@/features/search/components/TitleText/TitleText";
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
        <section className={styles.desktopSection}>
          <div className={styles.desktopSearchContainer}>
            <TitleText>Find a lesson</TitleText>
            <SearchButton label="What do you want to listen to?" onClick={onOpenSearch} />
          </div>
          <QuickBrowse
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
            <TitleText>Find a lesson</TitleText>
          </div>
          <SearchButton label="What do you want to listen to?" onClick={onOpenSearch} />
        </div>
        <QuickBrowse
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
