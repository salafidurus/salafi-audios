import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./SearchResultEmpty.mobile.module.css";

export type SearchResultEmptyMobileProps = {
  shouldSearch: boolean;
  isFetching: boolean;
  errorMessage?: string;
};

export function SearchResultEmptyMobile({
  shouldSearch,
  isFetching,
  errorMessage,
}: SearchResultEmptyMobileProps) {
  const { t } = useTranslation();
  const message = shouldSearch
    ? errorMessage
      ? errorMessage
      : isFetching
        ? t("search.searching", "Searching…")
        : t("search.noResults", "No results found.")
    : t("search.startTyping", "Start typing to search.");

  return (
    <div className={styles.container}>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
