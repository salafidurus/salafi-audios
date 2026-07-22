import React, { useEffect, useRef, type ReactNode } from "react";
import { List } from "../List";
import styles from "./InfiniteSectionList.module.css";

export type SectionData<TSection, TItem> = {
  key: string;
  section: TSection;
  data: TItem[];
};

export type InfiniteSectionListProps<TSection, TItem> = {
  /** Array of sections */
  sections: SectionData<TSection, TItem>[];
  /** Render the section header */
  renderSectionHeader: (section: TSection, sectionKey: string) => ReactNode;
  /** Render each item row */
  renderItem: (item: TItem, itemIndex: number, sectionKey: string) => ReactNode;
  /** Key extractor for items */
  itemKeyExtractor: (item: TItem, index: number) => string;
  /** Whether there are more sections/items to load */
  hasMore: boolean;
  /** Called when the sentinel enters viewport */
  onLoadMore: () => void;
  /** Whether currently fetching the next page */
  isFetchingNextPage?: boolean;
  /** Whether the initial data is loading */
  isLoading?: boolean;
  /** Rendered between items within a section */
  ItemSeparatorComponent?: () => ReactNode;
  /** Rendered between sections */
  SectionSeparatorComponent?: () => ReactNode;
  /** Empty state when sections is empty */
  emptyMessage?: string;
  /** Optional map ref to expose section DOM elements to parent (for scrollIntoView) */
  sectionRefs?: React.MutableRefObject<Record<string, HTMLElement | null>>;
};

export function InfiniteSectionList<TSection, TItem>({
  sections,
  renderSectionHeader,
  renderItem,
  itemKeyExtractor,
  hasMore,
  onLoadMore,
  isFetchingNextPage,
  isLoading,
  ItemSeparatorComponent,
  SectionSeparatorComponent,
  emptyMessage = "No items found",
  sectionRefs,
}: InfiniteSectionListProps<TSection, TItem>): ReactNode {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, isFetchingNextPage]);

  if (isLoading && sections.length === 0) {
    return <div className={styles.loading}>Loading items…</div>;
  }

  const totalItems = sections.reduce((acc, sec) => acc + sec.data.length, 0);

  if (sections.length === 0 || totalItems === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div>
      {sections.map((sectionData, sectionIndex) => (
        <section
          key={sectionData.key}
          id={sectionData.key}
          ref={(el) => {
            if (sectionRefs) {
              sectionRefs.current[sectionData.key] = el;
            }
          }}
          className={styles.section}
        >
          {renderSectionHeader(sectionData.section, sectionData.key)}

          <List>
            {sectionData.data.map((item, itemIndex) => (
              <React.Fragment key={itemKeyExtractor(item, itemIndex)}>
                {renderItem(item, itemIndex, sectionData.key)}
                {ItemSeparatorComponent && itemIndex < sectionData.data.length - 1 && (
                  <ItemSeparatorComponent />
                )}
              </React.Fragment>
            ))}
          </List>

          {SectionSeparatorComponent && sectionIndex < sections.length - 1 && (
            <SectionSeparatorComponent />
          )}
        </section>
      ))}

      <div ref={sentinelRef} className={styles.sentinel} />
      {isFetchingNextPage && <div className={styles.loadingMore}>Loading more…</div>}
    </div>
  );
}
