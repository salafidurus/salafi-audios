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
  const message = shouldSearch
    ? errorMessage
      ? errorMessage
      : isFetching
        ? "Searching…"
        : "No results found."
    : "Start typing to search.";

  return (
    <div className={styles.container}>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
