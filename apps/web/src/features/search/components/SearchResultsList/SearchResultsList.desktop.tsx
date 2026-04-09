import type React from "react";

import type { SearchResultRow } from "@sd/domain-search";
import { SearchResultEmptyDesktop } from "../SearchResultEmpty/SearchResultEmpty.desktop";

export type SearchResultsListDesktopProps = {
  items: SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  errorMessage?: string;
  renderItem: (item: SearchResultRow) => React.ReactElement | null;
};

export function SearchResultsListDesktop({
  items,
  isFetching,
  shouldSearch,
  errorMessage,
  renderItem,
}: SearchResultsListDesktopProps) {
  const shouldShowEmpty = items.length === 0 || Boolean(errorMessage);

  return (
    <div className="flex flex-col gap-[var(--space-component-gap-md)]">
      {shouldShowEmpty ? (
        <SearchResultEmptyDesktop
          shouldSearch={shouldSearch}
          isFetching={isFetching}
          errorMessage={errorMessage}
        />
      ) : null}
      <div className="flex flex-col gap-[var(--space-component-gap-sm)]">
        {items.map((item) => (
          <div key={item.id}>{renderItem(item)}</div>
        ))}
      </div>
    </div>
  );
}
