"use client";

import { useListingDetail, useListingContents } from "@sd/domain-content";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect, useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { AppText } from "@/shared/components/AppText/AppText";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Search } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { useFormatScholarName } from "@/shared/utils/format-scholar-name";

import { CollectionContentLayout } from "../../components/listing/CollectionContentLayout/CollectionContentLayout";
import { ContentList } from "../../components/listing/ContentList/ContentList";
import { MetaDataSection } from "../../components/listing/MetaDataSection/MetaDataSection";
import { QuickButtonSection } from "../../components/listing/QuickButtonSection/QuickButtonSection";
import { SeriesContextBar } from "../../components/listing/series-context-bar/series-context-bar";
import { contentItemAnchorId } from "../../utils/content-item-anchor-id";
import styles from "./listing-detail.screen.module.css";

export type ListingDetailScreenProps = {
  slug: string;
};

export function ListingDetailScreen({ slug }: ListingDetailScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const formatScholarName = useFormatScholarName();
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightItemId, setHighlightItemId] = useState<string | undefined>(undefined);
  const headerContentRef = useRef<HTMLDivElement>(null);

  const { data: listing, isFetching: isFetchingDetail, isError: isListingError, refetch: refetchListing } =
    useListingDetail(slug);
  const { data: contents, isFetching: isFetchingContents } = useListingContents(
    listing?.slug ?? "",
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) setHighlightItemId(hash.slice(1));
  }, []);

  useEffect(() => {
    if (!highlightItemId || !contents) return;
    document
      .getElementById(contentItemAnchorId(highlightItemId))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightItemId, contents]);

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

  if (isListingError && !listing) {
    return (
      <ScreenView center>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <AppText variant="titleMd">{t("lecture.error", "Failed to load content details")}</AppText>
          <button
            type="button"
            onClick={() => refetchListing()}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              background: "var(--action-primary)",
              color: "var(--content-on-primary)",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {t("common.retry", "Try again")}
          </button>
        </div>
      </ScreenView>
    );
  }

  if (isFetchingDetail && !listing) {
    return (
      <ScreenView>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <div>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => router.back()}
                aria-label={t("navigation.back", "Back")}
              >
                <ChevronLeft size={14} />
                <span>{t("navigation.back", "Back")}</span>
              </button>

              <div className={styles.headerTopRow} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px 0" }}>
                <div style={{ width: "60%", height: "24px", borderRadius: "4px", background: "var(--surface-subtle)" }} />
                <div style={{ width: "35%", height: "14px", borderRadius: "4px", background: "var(--surface-subtle)" }} />
              </div>
            </div>
          </StickyHeaderLayout.Header>

          <StickyHeaderLayout.Content>
            <div className={styles.contentWrapper} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`listing-detail-skeleton-${i}`} style={{ height: "56px", width: "100%", borderRadius: "8px", background: "var(--surface-subtle)" }} />
              ))}
            </div>
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
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

  if (listing.rootListing) {
    // The server-rendered page redirects a nested Lesson/Module's own slug to
    // its top-level listing (see app/.../listings/[slug]/page.tsx) before this
    // ever mounts. This guards against rendering the wrong content in the
    // rare case a client-side cache serves stale data past that redirect.
    return (
      <ScreenView center>
        <AppText variant="bodyMd">{t("lecture.loading", "Loading content…")}</AppText>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <div ref={headerContentRef}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.back()}
              aria-label={t("navigation.back", "Back")}
            >
              <ChevronLeft size={14} />
              <span>{t("navigation.back", "Back")}</span>
            </button>

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
                format="single"
                scholarName={formatScholarName(listing.scholar)}
                scholarSlug={listing.scholar.slug}
              />
            )}

            {contents?.format === "series" && (
              <ContentList
                items={filteredSingleOrSeriesItems}
                format="series"
                scholarName={formatScholarName(listing.scholar)}
                scholarSlug={listing.scholar.slug}
                seriesId={listing.id}
                seriesTitle={listing.title}
                highlightItemId={highlightItemId}
              />
            )}

            {contents?.format === "collection" && (
              <CollectionContentLayout
                modules={filteredModules}
                scholarName={formatScholarName(listing.scholar)}
                scholarSlug={listing.scholar.slug}
                collectionId={listing.id}
                highlightItemId={highlightItemId}
              />
            )}

            {listing.seriesContext && (
              <SeriesContextBar seriesContext={listing.seriesContext} lectureId={listing.id} />
            )}
          </div>
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
    </ScreenView>
  );
}
