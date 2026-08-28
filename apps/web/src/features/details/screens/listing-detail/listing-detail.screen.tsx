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

function getContentHeading(format: string | undefined, t: ReturnType<typeof useTranslation>["t"]) {
  if (format === "single") return t("listing.listenNow", "Listen now");
  if (format === "series") return t("listing.lessons", "Lessons");
  return null;
}

function getContentCountLabel(
  format: string | undefined,
  moduleCount: number,
  itemCount: number,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const isCollection = format === "collection";
  const count = isCollection ? moduleCount : itemCount;
  return getCountTranslation(isCollection, count, t);
}

function getCountTranslation(
  isCollection: boolean,
  count: number,
  t: ReturnType<typeof useTranslation>["t"],
) {
  const singular = count === 1;
  return t(
    isCollection
      ? singular
        ? "listing.module"
        : "listing.modules"
      : singular
        ? "listing.item"
        : "listing.items",
    isCollection ? (singular ? "module" : "modules") : singular ? "item" : "items",
  );
}

function isMultiItemListing(format: string | undefined) {
  return format === "series" || format === "collection";
}

type ListingContents = NonNullable<ReturnType<typeof useListingContents>["data"]>;
type Translation = ReturnType<typeof useTranslation>;
type FormatScholarName = ReturnType<typeof useFormatScholarName>;

type ListingContentModel = {
  contents: ListingContents;
  listing: NonNullable<ReturnType<typeof useListingDetail>["data"]>;
  contentCount: number;
  contentCountLabel: string;
  contentHeading: string | null;
  filteredSingleOrSeriesItems: React.ComponentProps<typeof ContentList>["items"];
  filteredModules: React.ComponentProps<typeof CollectionContentLayout>["modules"];
  formatScholarName: FormatScholarName;
  highlightItemId: string | undefined;
};

type ListingContentSectionProps = {
  model: ListingContentModel;
  t: Translation["t"];
};

function filterContentItems(contents: ListingContents | undefined, query: string) {
  if (!contents || (contents.format !== "single" && contents.format !== "series")) return [];
  if (!query) return contents.items;
  return contents.items.filter((item) => item.title.toLowerCase().includes(query));
}

function filterContentModules(contents: ListingContents | undefined, query: string) {
  if (!contents || contents.format !== "collection") return [];
  if (!query) return contents.modules;

  return contents.modules.flatMap((module) => {
    const lessons = module.lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(query) || module.title.toLowerCase().includes(query),
    );
    return lessons.length > 0 ? [{ ...module, lessons }] : [];
  });
}

function ListingContentSection({ model, t }: ListingContentSectionProps) {
  const {
    contents,
    contentCount,
    contentCountLabel,
    contentHeading,
    filteredSingleOrSeriesItems,
    filteredModules,
    formatScholarName,
    highlightItemId,
    listing,
  } = model;
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

type LoadedListingView = {
  listing: NonNullable<ReturnType<typeof useListingDetail>["data"]>;
  contents: ListingContents | undefined;
  isFetchingContents: boolean;
  isMultiItem: boolean;
  content: ListingContentModel | undefined;
  search: { value: string; onChange: (value: string) => void };
  router: ReturnType<typeof useRouter>;
  t: Translation["t"];
};

function LoadedListing({ view }: { view: LoadedListingView }) {
  const { listing, contents, isFetchingContents, isMultiItem, content, search, router, t } = view;
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
            moduleCount={contents?.format === "collection" ? contents.modules.length : undefined}
          />
          <QuickButtonSection listing={listing} contents={contents} />
          {isMultiItem ? (
            <div className={styles.searchWrapper}>
              <Search.Bar
                value={search.value}
                onChange={search.onChange}
                placeholder={t("listing.searchPlaceholder", "Search lessons…")}
              />
            </div>
          ) : null}
        </aside>
        <main className={styles.contentColumn}>
          <StickyHeaderLayout>
            <StickyHeaderLayout.Content>
              <div className={styles.contentWrapper}>
                {isFetchingContents && !contents ? (
                  <div className={styles.contentLoading} role="status">
                    <Skeleton className={styles.loadingRow} />
                    <span className="sr-only">{t("lecture.loading", "Loading lessons…")}</span>
                  </div>
                ) : null}
                {content ? <ListingContentSection model={content} t={t} /> : null}
                {listing.seriesContext ? (
                  <SeriesContextBar
                    seriesContext={listing.seriesContext}
                    listingSlug={listing.slug}
                  />
                ) : null}
              </div>
            </StickyHeaderLayout.Content>
          </StickyHeaderLayout>
        </main>
      </div>
    </ScreenView>
  );
}

type ListingFallbackState = "error" | "loading" | "not-found" | "nested";

function getListingFallbackState(
  isListingError: boolean,
  isFetchingDetail: boolean,
  hasListing: boolean,
  isNested: boolean,
): ListingFallbackState | null {
  if (isListingError && !hasListing) return "error";
  if (isFetchingDetail && !hasListing) return "loading";
  if (!hasListing) return "not-found";
  if (isNested) return "nested";
  return null;
}

function ListingDetailFallback({
  state,
  onRetry,
  onBack,
  t,
}: {
  state: ListingFallbackState;
  onRetry: () => void;
  onBack: () => void;
  t: Translation["t"];
}) {
  if (state === "error") {
    return (
      <ScreenView center>
        <Empty className={styles.state}>
          <EmptyHeader>
            <EmptyTitle>{t("lecture.error", "Failed to load content details")}</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="outline" onClick={onRetry}>
              {t("common.retry", "Try again")}
            </Button>
          </EmptyContent>
        </Empty>
      </ScreenView>
    );
  }

  if (state === "loading") {
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
                onClick={onBack}
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

  const title =
    state === "nested"
      ? t("lecture.loading", "Loading content…")
      : t("lecture.notFound", "Content not found");
  return (
    <ScreenView center>
      <Empty className={styles.state}>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    </ScreenView>
  );
}

function useListingHighlight(contents: ListingContents | undefined) {
  const [highlightItemId, setHighlightItemId] = useState<string | undefined>(undefined);

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

  return highlightItemId;
}

function useListingContentModel({
  contents,
  listing,
  searchQuery,
  formatScholarName,
  highlightItemId,
  t,
}: {
  contents: ListingContents | undefined;
  listing: NonNullable<ReturnType<typeof useListingDetail>["data"]> | undefined;
  searchQuery: string;
  formatScholarName: FormatScholarName;
  highlightItemId: string | undefined;
  t: Translation["t"];
}) {
  const isMultiItem = isMultiItemListing(listing?.format);
  const query = searchQuery.trim().toLowerCase();
  const filteredSingleOrSeriesItems = useMemo(
    () => filterContentItems(contents, query),
    [contents, query],
  );
  const filteredModules = useMemo(() => filterContentModules(contents, query), [contents, query]);
  const contentCount =
    contents?.format === "collection" ? filteredModules.length : filteredSingleOrSeriesItems.length;
  const contentCountLabel = getContentCountLabel(
    contents?.format,
    filteredModules.length,
    filteredSingleOrSeriesItems.length,
    t,
  );
  const contentHeading = getContentHeading(listing?.format, t);
  const content =
    contents && listing
      ? {
          contents,
          listing,
          contentCount,
          contentCountLabel,
          contentHeading,
          filteredSingleOrSeriesItems,
          filteredModules,
          formatScholarName,
          highlightItemId,
        }
      : undefined;

  return { isMultiItem, content };
}

export function ListingDetailScreen({ slug }: ListingDetailScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const formatScholarName = useFormatScholarName();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: listing,
    isFetching: isFetchingDetail,
    isError: isListingError,
    refetch: refetchListing,
  } = useListingDetail(slug);
  const { data: contents, isFetching: isFetchingContents } = useListingContents(
    listing?.slug ?? "",
  );
  const highlightItemId = useListingHighlight(contents);

  const { isMultiItem, content } = useListingContentModel({
    contents,
    listing,
    searchQuery,
    formatScholarName,
    highlightItemId,
    t,
  });

  const fallbackState = getListingFallbackState(
    isListingError,
    isFetchingDetail,
    Boolean(listing),
    Boolean(listing?.rootListing),
  );
  if (fallbackState) {
    return (
      <ListingDetailFallback
        state={fallbackState}
        onRetry={() => void refetchListing()}
        onBack={() => router.back()}
        t={t}
      />
    );
  }

  if (!listing) return null;

  const view: LoadedListingView = {
    listing,
    contents,
    isFetchingContents,
    isMultiItem,
    content,
    search: { value: searchQuery, onChange: setSearchQuery },
    router,
    t,
  };

  return <LoadedListing view={view} />;
}
