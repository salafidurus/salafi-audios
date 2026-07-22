"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useListingDetail, useListingContents } from "@sd/domain-content";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { AppText } from "@/shared/components/AppText/AppText";
import { Search } from "@/shared/components/Search";
import { useTranslation } from "@/core/i18n/use-translation";
import { formatScholarName } from "@/shared/utils/format-scholar-name";

import { MetaDataSection } from "../../components/listing/MetaDataSection/MetaDataSection";
import { QuickButtonSection } from "../../components/listing/QuickButtonSection/QuickButtonSection";
import { ContentList } from "../../components/listing/ContentList/ContentList";
import { CollectionContentLayout } from "../../components/listing/CollectionContentLayout/CollectionContentLayout";
import { SeriesContextBar } from "../../components/listing/series-context-bar/series-context-bar";

import styles from "./listing-detail.screen.module.css";

export type ListingDetailScreenProps = {
  slug: string;
};

export function ListingDetailScreen({ slug }: ListingDetailScreenProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const headerContentRef = useRef<HTMLDivElement>(null);

  const { data: listing, isFetching: isFetchingDetail } = useListingDetail(slug);
  const { data: contents, isFetching: isFetchingContents } = useListingContents(listing?.id ?? "");

  // Measure sticky header height dynamically (including outer padding) for scroll margin and TOC offset
  useEffect(() => {
    const el = headerContentRef.current;
    if (!el) return;

    const updateHeight = () => {
      const stickyHeaderEl = el.closest('[class*="stickyHeader"]') as HTMLElement | null;
      const height = stickyHeaderEl
        ? stickyHeaderEl.getBoundingClientRect().height
        : el.getBoundingClientRect().height + 32;
      document.documentElement.style.setProperty("--sticky-header-height", `${height}px`);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, [listing, contents]);

  const isMultiItem = listing?.format === "series" || listing?.format === "collection";
  const query = searchQuery.trim().toLowerCase();

  // Filter items for search
  const filteredSingleOrSeriesItems = useMemo(() => {
    if (!contents || (contents.format !== "single" && contents.format !== "series")) return [];
    if (!query) return contents.items;
    return contents.items.filter((item) => item.title.toLowerCase().includes(query));
  }, [contents, query]);

  const filteredModules = useMemo(() => {
    if (!contents || contents.format !== "collection") return [];
    if (!query) return contents.modules;

    const result: typeof contents.modules = [];
    for (const m of contents.modules) {
      const matchingLessons = m.lessons.filter(
        (l) => l.title.toLowerCase().includes(query) || m.title.toLowerCase().includes(query),
      );
      if (matchingLessons.length > 0) {
        result.push({ ...m, lessons: matchingLessons });
      }
    }
    return result;
  }, [contents, query]);

  if (isFetchingDetail) {
    return (
      <ScreenView center>
        <AppText variant="bodyMd">{t("lecture.loading", "Loading content…")}</AppText>
      </ScreenView>
    );
  }

  if (!listing) {
    return (
      <ScreenView center>
        <AppText variant="titleMd">{t("lecture.notFound", "Content not found")}</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <div ref={headerContentRef}>
            <div className={styles.headerTopRow}>
              <MetaDataSection listing={listing} />
              <QuickButtonSection listing={listing} contents={contents} />
            </div>

            {isMultiItem && (
              <div className={styles.searchWrapper}>
                <Search.Bar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={t("listing.searchPlaceholder", "Search lessons…")}
                />
              </div>
            )}
          </div>
        </StickyHeaderLayout.Header>

        <StickyHeaderLayout.Content>
          <div className={styles.contentWrapper}>
            {isFetchingContents && !contents && (
              <AppText variant="bodySm">{t("lecture.loading", "Loading lessons…")}</AppText>
            )}

            {contents?.format === "single" && (
              <ContentList
                items={filteredSingleOrSeriesItems}
                scholarName={formatScholarName(listing.scholar)}
              />
            )}

            {contents?.format === "series" && (
              <ContentList
                items={filteredSingleOrSeriesItems}
                scholarName={formatScholarName(listing.scholar)}
                seriesId={listing.id}
                seriesTitle={listing.title}
              />
            )}

            {contents?.format === "collection" && (
              <CollectionContentLayout
                modules={filteredModules}
                scholarName={formatScholarName(listing.scholar)}
                collectionId={listing.id}
              />
            )}

            {listing.seriesContext && <SeriesContextBar seriesContext={listing.seriesContext} />}
          </div>
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
    </ScreenView>
  );
}
