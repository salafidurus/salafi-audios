/** Documents this module's responsibility and public boundary. */
"use client";

import type { ListingModuleDto, ListingContentItemDto } from "@sd/core-contracts";

import { buildTrackQueue, type Track } from "@sd/domain-audio";
import React, { useEffect, useState, useRef } from "react";

import { InfiniteSectionList, type SectionData } from "@/shared/components/InfiniteSectionList";

import { CollectionToc } from "../CollectionToc/CollectionToc";
import { ContentListItem } from "../ContentListItem/ContentListItem";
import styles from "./CollectionContentLayout.module.css";

/** Documents the intent and contract of this declaration. */
export type CollectionContentLayoutProps = {
  modules: ListingModuleDto[];
  scholarName?: string;
  /** Documents the intent and contract of this field. */ scholarSlug?: string;
  collectionId?: string;
  /** Item id to scroll to and briefly highlight on mount (e.g. a lesson linked via URL anchor). */
  highlightItemId?: string;
};

/** Documents the intent and contract of this declaration. */
export function CollectionContentLayout({
  modules,
  scholarName = "",
  scholarSlug,
  collectionId,
  highlightItemId,
}: CollectionContentLayoutProps) {
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>(modules[0]?.id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const pendingModuleId = useRef<string | null>(null);
  const activeModuleId = modules.some((module) => module.id === selectedModuleId)
    ? selectedModuleId
    : modules[0]?.id;

  useEffect(() => {
    const sections = modules
      .map((module) => sectionRefs.current[module.id])
      .filter((section): section is HTMLElement => Boolean(section));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          pendingModuleId.current &&
          !modules.some((module) => module.id === pendingModuleId.current)
        ) {
          pendingModuleId.current = null;
        }
        const pendingEntry = entries.find(
          (entry) => entry.target.id === pendingModuleId.current && entry.isIntersecting,
        );
        if (pendingModuleId.current) {
          if (!pendingEntry) return;
          pendingModuleId.current = null;
        }
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setSelectedModuleId(visible.target.id);
      },
      { rootMargin: "-18% 0px -65% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, [modules]);

  const scrollToModule = (moduleId: string) => {
    pendingModuleId.current = moduleId;
    setSelectedModuleId(moduleId);
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
              <h3 className={styles.moduleTitle}>{mod.title}</h3>
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
          activeModuleId={activeModuleId}
          isCollapsed={isTocCollapsed}
          onToggleCollapse={() => setIsTocCollapsed((prev) => !prev)}
        />
      </aside>
    </div>
  );
}
