import type React from "react";

import type { SearchResultRow } from "../../utils/build-search-result-rows";
import { SearchResultEmptyDesktopWeb } from "../SearchResultEmpty/SearchResultEmpty.desktop.web";

export type SearchResultsListDesktopWebProps = {
  items: SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  errorMessage?: string;
  renderItem: (item: SearchResultRow) => React.ReactElement | null;
};

export function SearchResultsListDesktopWeb({
  items,
  isFetching,
  shouldSearch,
  errorMessage,
  renderItem,
}: SearchResultsListDesktopWebProps) {
  const shouldShowEmpty = items.length === 0 || Boolean(errorMessage);

  return (
    <div className="flex flex-col gap-[var(--space-component-gap-md)]">
      {shouldShowEmpty ? (
        <SearchResultEmptyDesktopWeb
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
