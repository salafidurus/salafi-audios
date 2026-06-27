import { QuickBrowseMobile } from "@/features/search/components/QuickBrowse/QuickBrowse.mobile";
import { SearchButtonMobile } from "@/features/search/components/SearchButton/SearchButton.mobile";
import { TitleTextMobile } from "@/features/search/components/TitleText/TitleText.mobile";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useQuickBrowse } from "@sd/domain-search";
import styles from "./search-home.screen.mobile.module.css";

import type { ListingFormat } from "@sd/core-contracts";

export type SearchHomeMobileScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (id: string, kind: ListingFormat) => void;
  onContinueListening?: (lectureId: string) => void;
};

export function SearchHomeMobileScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeMobileScreenProps) {
  const { data, isLoading } = useQuickBrowse();

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
