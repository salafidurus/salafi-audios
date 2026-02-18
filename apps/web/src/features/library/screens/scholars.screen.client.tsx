"use client";

import { Shell } from "@/features/library/components/layout/shell/shell";
import { EmptyState } from "@/features/library/components/states/empty-state/empty-state";
import { SearchBar } from "@/shared/components/search-bar";
import { ScholarCard, type ScholarCardItem } from "@/shared/components/scholar-card";
import { ScholarHero, type ScholarHeroItem } from "@/shared/components/scholar-hero/scholar-hero";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./scholars.screen.module.css";

type Scholar = {
  id: string;
  slug: string;
  name: string;
  bio?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  isKibar: boolean;
  isActive: boolean;
  collectionsCount?: number;
  standaloneSeriesCount?: number;
  standaloneLecturesCount?: number;
};

type Topic = {
  id: string;
  slug: string;
  name: string;
};

type ScholarsScreenClientProps = {
  scholars: Scholar[];
  topics: Topic[];
  featuredScholars: ScholarHeroItem[];
};

export function ScholarsScreenClient({
  scholars,
  topics,
  featuredScholars,
}: ScholarsScreenClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const allScholars = scholars.filter((s) => s.isActive);
  const popularTopics = topics.slice(0, 12);

  const scholarCards: ScholarCardItem[] = useMemo(() => {
    let result = allScholars;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.country?.toLowerCase().includes(query) ||
          s.bio?.toLowerCase().includes(query),
      );
    }

    return result.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      bio: s.bio,
      imageUrl: s.imageUrl,
      isKibar: s.isKibar,
      collectionsCount: s.collectionsCount ?? 0,
      standaloneSeriesCount: s.standaloneSeriesCount ?? 0,
      standaloneLecturesCount: s.standaloneLecturesCount ?? 0,
    }));
  }, [allScholars, searchQuery]);

  const toggleTopic = (topicSlug: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topicSlug)) {
        return prev.filter((t) => t !== topicSlug);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, topicSlug];
    });
  };

  return (
    <Shell title="Scholars" hideHeader>
      {scholars.length === 0 ? (
        <EmptyState message="No scholars are published yet." />
      ) : (
        <>
          <h1 className={styles.pageHeading}>Scholars</h1>
          {featuredScholars.length > 0 && (
            <ScholarHero
              items={featuredScholars}
              title="Learn from the Best Scholars"
              description="Connect with world-renowned senior scholars in Islamic sciences. Knowledge is sought from those who possess it."
            />
          )}

          <section className={styles.allScholarsSection}>
            <div className={styles.searchWrapper}>
              <SearchBar
                placeholder="Search by name, specialization, or country..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            <div className={styles.filterSection}>
              <div className={styles.filterTabs}>
                {popularTopics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.slug);
                  const isDisabled = !isSelected && selectedTopics.length >= 3;
                  return (
                    <button
                      key={topic.slug}
                      type="button"
                      className={isSelected ? styles.filterTabActive : styles.filterTab}
                      onClick={() => toggleTopic(topic.slug)}
                      disabled={isDisabled}
                      style={{ opacity: isDisabled ? 0.5 : 1 }}
                    >
                      {topic.name}
                      {isSelected && <X size={14} className={styles.removeIcon} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.scholarsGrid} role="list" aria-label="Scholars directory">
              {scholarCards.map((scholar) => (
                <ScholarCard key={scholar.id} scholar={scholar} />
              ))}
            </div>
          </section>
        </>
      )}
    </Shell>
  );
}
