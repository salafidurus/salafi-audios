"use client";

import type { ListingModuleDto, ListingContentItemDto } from "@sd/core-contracts";

import { buildTrackQueue, type Track } from "@sd/domain-audio";
import React, { useState, useRef } from "react";

import { InfiniteSectionList, type SectionData } from "@/shared/components/InfiniteSectionList";

import { CollectionToc } from "../CollectionToc/CollectionToc";
import { ContentListItem } from "../ContentListItem/ContentListItem";
import styles from "./CollectionContentLayout.module.css";

export type CollectionContentLayoutProps = {
  modules: ListingModuleDto[];
  scholarName?: string;
  scholarSlug?: string;
  collectionId?: string;
  /** Item id to scroll to and briefly highlight on mount (e.g. a lesson linked via URL anchor). */
  highlightItemId?: string;
};

export function CollectionContentLayout({
  modules,
  scholarName = "",
  scholarSlug,
  collectionId,
  highlightItemId,
}: CollectionContentLayoutProps) {
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToModule = (moduleId: string) => {
    const el = sectionRefs.current[moduleId];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sections: SectionData<ListingModuleDto, ListingContentItemDto>[] = modules.map((m) => ({
    key: m.id,
    section: m,
    data: m.lessons,
  }));

  // Construct all tracks across all modules for full queue context, crossing
  // module boundaries in order (all of module N's lessons, then module N+1's).
  const allTracksInContext: Track[] = buildTrackQueue(
    { id: collectionId ?? "", title: "", format: "collection", scholarName, scholarSlug },
    { format: "collection", modules },
  );

  return (
    <div className={`${styles.layout} ${isTocCollapsed ? styles.tocCollapsed : ""}`}>
      <div className={styles.listColumn}>
        <InfiniteSectionList
          sections={sections}
          sectionRefs={sectionRefs}
          hasMore={false}
          onLoadMore={() => {}}
          renderSectionHeader={(mod) => (
            <div className={styles.moduleHeader}>
              <h2 className={styles.moduleTitle}>{mod.title}</h2>
            </div>
          )}
          renderItem={(lesson, _index, sectionKey) => {
            const mod = modules.find((m) => m.id === sectionKey);
            return (
              <ContentListItem
                item={lesson}
                scholarName={scholarName}
                scholarSlug={scholarSlug}
                moduleId={sectionKey}
                moduleTitle={mod?.title}
                collectionId={collectionId}
                allTracksInContext={allTracksInContext}
                highlightItemId={highlightItemId}
              />
            );
          }}
          itemKeyExtractor={(lesson) => lesson.id}
        />
      </div>

      <aside className={styles.tocColumn}>
        <CollectionToc
          modules={modules}
          onSelect={scrollToModule}
          isCollapsed={isTocCollapsed}
          onToggleCollapse={() => setIsTocCollapsed((prev) => !prev)}
        />
      </aside>
    </div>
  );
}
