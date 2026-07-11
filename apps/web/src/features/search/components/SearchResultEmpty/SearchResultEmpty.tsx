"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import { List } from "@/shared/components/List";
import styles from "./SearchResultEmpty.module.css";

export type SearchResultEmptyProps = {
  shouldSearch: boolean;
  isFetching: boolean;
  errorMessage?: string;
};

export function SearchResultEmpty({
  shouldSearch,
  isFetching,
  errorMessage,
}: SearchResultEmptyProps) {
  const { t } = useTranslation();
  const message = shouldSearch
    ? errorMessage
      ? errorMessage
      : isFetching
        ? t("search.searching", "Searching.")
        : t("search.noResults", "No results found.")
    : t("search.startTyping", "Start typing to search.");

  return (
    <List.Item>
      <div className={styles.container}>
        <p className={styles.message}>{message}</p>
      </div>
    </List.Item>
  );
}
