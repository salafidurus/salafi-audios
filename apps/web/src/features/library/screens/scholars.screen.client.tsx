"use client";

import { ScholarAvatarCard } from "@/features/library/components/cards/scholar-avatar/scholar-avatar-card";
import { Shell } from "@/features/library/components/layout/shell/shell";
import { EmptyState } from "@/features/library/components/states/empty-state/empty-state";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
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
};

type Topic = {
  id: string;
  slug: string;
  name: string;
};

type ScholarsScreenClientProps = {
  scholars: Scholar[];
  topics: Topic[];
};

export function ScholarsScreenClient({ scholars, topics }: ScholarsScreenClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  const featuredScholars = scholars.filter((s) => s.isKibar).slice(0, 10);
  const allScholars = scholars.filter((s) => s.isActive);

  const popularTopics = topics.slice(0, 12);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const filteredScholars = useMemo(() => {
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

    return result;
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
          <div className={styles.heroSection}>
            <h2 className={styles.heroHeading}>
              Learn from the <span className={styles.heroEmphasis}>Best Scholars</span>
            </h2>
            <p className={styles.heroSubheading}>
              Connect with world-renowned senior scholars in Islamic sciences. Knowledge is sought
              from those who possess it.
            </p>
          </div>

          {featuredScholars.length > 0 && (
            <section className={styles.featuredSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Featured Scholars</h3>
                <div className={styles.carouselControls}>
                  <button
                    type="button"
                    className={styles.carouselButton}
                    onClick={() => scrollCarousel("left")}
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className={styles.carouselButton}
                    onClick={() => scrollCarousel("right")}
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              <div className={styles.carouselWrapper}>
                <div className={styles.featuredCarousel} ref={carouselRef}>
                  {featuredScholars.map((scholar) => {
                    const bioPreview = scholar.bio
                      ? scholar.bio.length > 80
                        ? `${scholar.bio.substring(0, 80)}...`
                        : scholar.bio
                      : "A leading authority in Islamic sciences with decades of teaching.";

                    return (
                      <a
                        key={scholar.id}
                        href={`/scholars/${scholar.slug}`}
                        className={styles.featuredCard}
                        style={
                          scholar.imageUrl
                            ? {
                                backgroundImage: `url(${scholar.imageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      >
                        {!scholar.imageUrl && (
                          <div className={styles.featuredPlaceholder}>
                            <span className={styles.featuredInitial}>
                              {scholar.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className={styles.featuredOverlay}>
                          <span className={styles.featuredBadge}>Prominent Scholar</span>
                          <h4 className={styles.featuredName}>{scholar.name}</h4>
                          <p className={styles.featuredBio}>{bioPreview}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          <section className={styles.allScholarsSection}>
            <div className={styles.searchContainer}>
              <svg
                className={styles.searchIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search by name, specialization, or country..."
                className={styles.searchInput}
                aria-label="Search scholars"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

            <ul className={styles.scholarsGrid} aria-label="Scholars directory">
              {filteredScholars.map((scholar) => {
                const bioPreview = scholar.bio
                  ? scholar.bio.length > 100
                    ? `${scholar.bio.substring(0, 100)}...`
                    : scholar.bio
                  : undefined;

                return (
                  <li key={scholar.id} className={styles.scholarCard}>
                    <ScholarAvatarCard
                      href={`/scholars/${scholar.slug}`}
                      name={scholar.name}
                      subtitle={scholar.country ?? undefined}
                      size="lg"
                      showInitial={true}
                      imageUrl={scholar.imageUrl ?? undefined}
                      actionLabel="View Lessons"
                      showBio={!!bioPreview}
                      bioText={bioPreview}
                      showFollowButton={true}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </Shell>
  );
}
