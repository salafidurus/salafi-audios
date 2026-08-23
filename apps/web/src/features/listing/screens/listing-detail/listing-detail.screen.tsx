"use client";

import { useListingDetail, useListingContents } from "@sd/domain-content";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Search } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { Button } from "@/shared/components/ui/button";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/shared/components/ui/empty";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
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

type ListingContents = NonNullable<ReturnType<typeof useListingContents>["data"]>;
type Translation = ReturnType<typeof useTranslation>;
type FormatScholarName = ReturnType<typeof useFormatScholarName>;

type ListingContentSectionProps = {
  contents: ListingContents;
  contentCount: number;
  contentCountLabel: string;
  contentHeading: string | null;
  filteredSingleOrSeriesItems: React.ComponentProps<typeof ContentList>["items"];
  filteredModules: React.ComponentProps<typeof CollectionContentLayout>["modules"];
  formatScholarName: FormatScholarName;
  highlightItemId: string | undefined;
  listing: NonNullable<ReturnType<typeof useListingDetail>["data"]>;
  t: Translation["t"];
};

function ListingContentSection({
  contents,
  contentCount,
  contentCountLabel,
  contentHeading,
  filteredSingleOrSeriesItems,
  filteredModules,
  formatScholarName,
  highlightItemId,
  listing,
  t,
}: ListingContentSectionProps) {
  return (
    <section
      aria-label={contentHeading ? undefined : t("listing.collectionContent", "Collection content")}
      aria-labelledby={contentHeading ? "listing-content-heading" : undefined}
      className={styles.contentRegion}
    >
      {contents.format !== "collection" && (
        <>
          <div
            className={`${styles.contentIntro} ${contentHeading ? "" : styles.contentIntroCountOnly}`}
          >
            {contentHeading && (
              <h2 id="listing-content-heading" className={styles.contentHeading}>
                {contentHeading}
              </h2>
            )}
            <span className={styles.contentCount}>
              {contentCount} {contentCountLabel}
            </span>
          </div>
          <Separator />
        </>
      )}

      {contents.format === "single" && (
        <ContentList
          items={filteredSingleOrSeriesItems}
          format="single"
          scholarName={formatScholarName(listing.scholar)}
          scholarSlug={listing.scholar.slug}
        />
      )}

      {contents.format === "series" && (
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

      {contents.format === "collection" && (
        <CollectionContentLayout
          modules={filteredModules}
          scholarName={formatScholarName(listing.scholar)}
          scholarSlug={listing.scholar.slug}
          collectionId={listing.id}
          highlightItemId={highlightItemId}
        />
      )}
    </section>
  );
}

export function ListingDetailScreen({ slug }: ListingDetailScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const formatScholarName = useFormatScholarName();
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightItemId, setHighlightItemId] = useState<string | undefined>(undefined);

  const {
    data: listing,
    isFetching: isFetchingDetail,
    isError: isListingError,
    refetch: refetchListing,
  } = useListingDetail(slug);
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

  const contentCount =
    contents?.format === "collection" ? filteredModules.length : filteredSingleOrSeriesItems.length;
  const contentHeading =
    listing?.format === "single"
      ? t("listing.listenNow", "Listen now")
      : listing?.format === "series"
        ? t("listing.lessons", "Lessons")
        : null;
  const contentCountLabel =
    contents?.format === "collection"
      ? t(
          filteredModules.length === 1 ? "listing.module" : "listing.modules",
          filteredModules.length === 1 ? "module" : "modules",
        )
      : t(
          filteredSingleOrSeriesItems.length === 1 ? "listing.item" : "listing.items",
          filteredSingleOrSeriesItems.length === 1 ? "item" : "items",
        );

  if (isListingError && !listing) {
    return (
      <ScreenView center>
        <Empty className={styles.state}>
          <EmptyHeader>
            <EmptyTitle>{t("lecture.error", "Failed to load content details")}</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" onClick={() => refetchListing()}>
              {t("common.retry", "Try again")}
            </Button>
          </EmptyContent>
        </Empty>
      </ScreenView>
    );
  }

  if (isFetchingDetail && !listing) {
    return (
      <ScreenView>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={styles.backButton}
                onClick={() => router.back()}
                aria-label={t("navigation.back", "Back")}
              >
                <ChevronLeft data-icon="inline-start" />
                {t("navigation.back", "Back")}
              </Button>

              <div className={styles.loadingHeader}>
                <Skeleton className={styles.loadingTitle} />
                <Skeleton className={styles.loadingSubtitle} />
              </div>
            </div>
          </StickyHeaderLayout.Header>

          <StickyHeaderLayout.Content>
            <div className={styles.contentWrapper}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={`listing-detail-skeleton-${i}`} className={styles.loadingRow} />
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
        <Empty className={styles.state}>
          <EmptyHeader>
            <EmptyTitle>{t("lecture.notFound", "Content not found")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
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
        <Empty className={styles.state}>
          <EmptyHeader>
            <EmptyTitle>{t("lecture.loading", "Loading content…")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <div className={styles.pageLayout}>
        <aside className={styles.detailsRail} aria-label={t("listing.details", "Listing details")}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label={t("navigation.back", "Back")}
          >
            <ChevronLeft data-icon="inline-start" />
            {t("navigation.back", "Back")}
          </Button>
          <MetaDataSection
            listing={listing}
            layout="sidebar"
            moduleCount={contents?.format === "collection" ? filteredModules.length : undefined}
          />
          <QuickButtonSection listing={listing} contents={contents} />
          {isMultiItem && (
            <div className={styles.searchWrapper}>
              <Search.Bar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t("listing.searchPlaceholder", "Search lessons…")}
              />
            </div>
          )}
        </aside>

        <main className={styles.contentColumn}>
          <StickyHeaderLayout>
            <StickyHeaderLayout.Content>
              <div className={styles.contentWrapper}>
                {isFetchingContents && !contents && (
                  <div className={styles.contentLoading} role="status">
                    <Skeleton className={styles.loadingRow} />
                    <span className="sr-only">{t("lecture.loading", "Loading lessons…")}</span>
                  </div>
                )}

                {contents && (
                  <ListingContentSection
                    contents={contents}
                    contentCount={contentCount}
                    contentCountLabel={contentCountLabel}
                    contentHeading={contentHeading}
                    filteredSingleOrSeriesItems={filteredSingleOrSeriesItems}
                    filteredModules={filteredModules}
                    formatScholarName={formatScholarName}
                    highlightItemId={highlightItemId}
                    listing={listing}
                    t={t}
                  />
                )}

                {listing.seriesContext && (
                  <SeriesContextBar seriesContext={listing.seriesContext} lectureId={listing.id} />
                )}
              </div>
            </StickyHeaderLayout.Content>
          </StickyHeaderLayout>
        </main>
      </div>
    </ScreenView>
  );
}
