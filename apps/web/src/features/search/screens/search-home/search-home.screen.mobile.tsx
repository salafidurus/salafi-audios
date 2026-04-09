import { QuickBrowseMobile } from "../../components/QuickBrowse/QuickBrowse.mobile";
import { SearchButtonMobile } from "../../components/SearchButton/SearchButton.mobile";
import { TitleTextMobile } from "../../components/TitleText/TitleText.mobile";
import { ScreenView } from "../../../../shared/components/ScreenView/ScreenView";
import { useQuickBrowse } from "@sd/domain-search";
import styles from "./search-home.screen.mobile.module.css";

export type SearchHomeScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
  onSelectScholar?: (slug: string) => void;
  onSelectSuggestion?: (slug: string) => void;
  onContinueListening?: (lectureSlug: string) => void;
};

export function SearchHomeMobileScreen({
  onOpenSearch,
  onSelectCategory,
  onSelectScholar,
  onSelectSuggestion,
  onContinueListening,
}: SearchHomeScreenProps) {
  const { data } = useQuickBrowse();

  return (
    <ScreenView center>
      <div className={styles.content}>
        <div className={styles.searchGroup}>
          <div className={styles.header}>
            <TitleTextMobile>Find a lesson</TitleTextMobile>
          </div>
          <SearchButtonMobile
            placeholder="What do you want to listen to?"
            onPress={onOpenSearch}
          />
        </div>
        <QuickBrowseMobile
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
