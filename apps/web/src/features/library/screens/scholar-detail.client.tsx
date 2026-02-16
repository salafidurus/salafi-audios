"use client";

import { SeriesListItem } from "@/features/library/components/cards/series-list-item/series-list-item";
import { ScholarTabs, TabType } from "@/features/library/components/scholar-profile/scholar-tabs";
import { EmptyState } from "@/features/library/components/states/empty-state/empty-state";
import { Button } from "@/shared/components/button/button";
import type {
  CollectionViewDto,
  LectureViewDto,
  ScholarDetailDto,
  SeriesViewDto,
} from "@sd/api-client";
import { useMemo, useState } from "react";
import styles from "./scholar-detail.client.module.css";

interface ScholarDetailClientProps {
  scholar: ScholarDetailDto;
  collections: CollectionViewDto[];
  series: SeriesViewDto[];
  lectures: LectureViewDto[];
}

export function ScholarDetailClient({
  scholar,
  collections,
  series,
  lectures,
}: ScholarDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("collections");
  const [visibleCollections, setVisibleCollections] = useState(6);
  const [visibleSeries, setVisibleSeries] = useState(5);
  const [visibleLectures, setVisibleLectures] = useState(10);

  // Determine available tabs based on content
  const availableTabs = useMemo<TabType[]>(() => {
    const tabs: TabType[] = [];
    if (collections.length > 0) tabs.push("collections");
    if (series.length > 0) tabs.push("series");
    if (lectures.length > 0) tabs.push("lectures");
    if (scholar.bio) tabs.push("biography");
    return tabs;
  }, [collections.length, series.length, lectures.length, scholar.bio]);

  // Load more handlers
  const loadMoreCollections = () => setVisibleCollections((prev) => prev + 6);
  const loadMoreSeries = () => setVisibleSeries((prev) => prev + 5);
  const loadMoreLectures = () => setVisibleLectures((prev) => prev + 10);

  const displayedCollections = collections.slice(0, visibleCollections);
  const displayedSeries = series.slice(0, visibleSeries);
  const displayedLectures = lectures.slice(0, visibleLectures);

  const hasMoreCollections = visibleCollections < collections.length;
  const hasMoreSeries = visibleSeries < series.length;
  const hasMoreLectures = visibleLectures < lectures.length;

  return (
    <div className={styles.container}>
      <ScholarTabs activeTab={activeTab} onTabChange={setActiveTab} availableTabs={availableTabs} />

      {/* Collections Tab */}
      {activeTab === "collections" && (
        <div className={styles.tabContent}>
          {collections.length === 0 ? (
            <EmptyState message="This scholar has no published collections." />
          ) : (
            <>
              <div className={styles.collectionsList}>
                {displayedCollections.map((collection) => (
                  <SeriesListItem
                    key={collection.id}
                    item={collection}
                    scholarSlug={scholar.slug}
                    itemType="collection"
                  />
                ))}
              </div>
              {hasMoreCollections && (
                <div className={styles.loadMore}>
                  <Button variant="surface" onClick={loadMoreCollections}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Series Tab */}
      {activeTab === "series" && (
        <div className={styles.tabContent}>
          {series.length === 0 ? (
            <EmptyState message="This scholar has no standalone series." />
          ) : (
            <>
              <div className={styles.seriesList}>
                {displayedSeries.map((item) => (
                  <SeriesListItem key={item.id} item={item} scholarSlug={scholar.slug} />
                ))}
              </div>
              {hasMoreSeries && (
                <div className={styles.loadMore}>
                  <Button variant="surface" onClick={loadMoreSeries}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Lectures Tab */}
      {activeTab === "lectures" && (
        <div className={styles.tabContent}>
          {lectures.length === 0 ? (
            <EmptyState message="This scholar has no standalone lectures." />
          ) : (
            <>
              <div className={styles.lecturesList}>
                {displayedLectures.map((lecture) => (
                  <SeriesListItem
                    key={lecture.id}
                    item={{
                      id: lecture.id,
                      slug: lecture.slug,
                      title: lecture.title,
                      description: lecture.description ?? undefined,
                      durationSeconds: lecture.durationSeconds ?? undefined,
                    }}
                    scholarSlug={scholar.slug}
                    itemType="lecture"
                  />
                ))}
              </div>
              {hasMoreLectures && (
                <div className={styles.loadMore}>
                  <Button variant="surface" onClick={loadMoreLectures}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Biography Tab */}
      {activeTab === "biography" && (
        <div className={styles.tabContent}>
          {scholar.bio ? (
            <div className={styles.biography}>
              <p>{scholar.bio}</p>
            </div>
          ) : (
            <EmptyState message="No biography available for this scholar." />
          )}
        </div>
      )}
    </div>
  );
}
