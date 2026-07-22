"use client";

import React, { useState, useRef } from "react";
import type { ListingModuleDto, ListingContentItemDto } from "@sd/core-contracts";
import type { Track } from "@sd/domain-audio";
import { InfiniteSectionList, type SectionData } from "@/shared/components/InfiniteSectionList";
import { AppText } from "@/shared/components/AppText/AppText";
import { ContentListItem } from "../ContentListItem/ContentListItem";
import { CollectionToc } from "../CollectionToc/CollectionToc";
import styles from "./CollectionContentLayout.module.css";

export type CollectionContentLayoutProps = {
  modules: ListingModuleDto[];
  scholarName?: string;
  collectionId?: string;
};

export function CollectionContentLayout({
  modules,
  scholarName = "",
  collectionId,
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

  // Construct all tracks across all modules for full queue context
  const allTracksInContext: Track[] = [];
  let isFirst = true;
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      allTracksInContext.push({
        id: lesson.id,
        title: lesson.title,
        artist: scholarName,
        url: isFirst ? (lesson.primaryAudioAsset?.url ?? "") : "",
        durationSeconds: lesson.durationSeconds || lesson.primaryAudioAsset?.durationSeconds || 0,
        seriesId: mod.id,
        seriesTitle: mod.title,
        collectionId: collectionId ?? null,
      });
      isFirst = false;
    }
  }

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
              <AppText variant="titleLg" color="primary">
                {mod.title}
              </AppText>
            </div>
          )}
          renderItem={(lesson, _index, sectionKey) => {
            const mod = modules.find((m) => m.id === sectionKey);
            return (
              <ContentListItem
                item={lesson}
                scholarName={scholarName}
                seriesId={sectionKey}
                seriesTitle={mod?.title}
                collectionId={collectionId}
                allTracksInContext={allTracksInContext}
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
