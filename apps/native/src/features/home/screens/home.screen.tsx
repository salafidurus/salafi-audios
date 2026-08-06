import type { Href } from "expo-router";

import { routes } from "@sd/core-contracts";
import { usePlaybackStore } from "@sd/domain-audio";
import {
  useExploreRecentScreen,
  useHomePromotions,
  useInfiniteScholarsList,
} from "@sd/domain-content";
import { useContinueListening, useSearchProcessing } from "@sd/domain-search";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SearchFilter } from "@/features/search/components/SearchFilter/SearchFilter";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { SearchResultsList } from "@/features/search/components/SearchResultsList/SearchResultsList";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { ScreenHeader } from "@/shared/components";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import { CategoryChipsRail } from "../components/category-chips/category-chips-rail";
import { CuratedCollectionsBanner } from "../components/curated-collections-banner/curated-collections-banner";
import { HeroSection } from "../components/hero-section/hero-section";
import { QuickActionsRow } from "../components/quick-actions/quick-actions-row";
import { RecentlyAddedSection } from "../components/recently-added-section/recently-added-section";
import { ScholarMedallionsRail } from "../components/scholar-medallions/scholar-medallions-rail";

export type HomeScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

const FALLBACK_SCHOLARS = [
  { id: "1", slug: "uthaymin", name: "Salih al-‘Uthaymin", initials: "M" },
  { id: "2", slug: "fawzan", name: "Fawzan al-Fawzan", initials: "S" },
  { id: "3", slug: "bukhari", name: "AbdirRaheem al-Bukhari", initials: "A" },
  { id: "4", slug: "mabram", name: "bn Mabram", initials: "M" },
];

export function HomeScreen({ onNavigateToListing, onNavigateToScholar }: HomeScreenProps) {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();
  const showOriginal = useShowOriginalContent();

  const [searchQuery, setSearchQuery] = useState("");

  const searchOptions = useMemo(() => ({ prefill: "", showOriginal }), [showOriginal]);
  const { setQuery, filter, setFilter, topics, items, isFetching, shouldSearch, errorMessage } =
    useSearchProcessing(searchOptions);

  const currentTrack = usePlaybackStore((s) => s.currentTrack);
  const { recentProgress } = useContinueListening();
  const { data: feedData, isLoading: feedLoading } = useExploreRecentScreen({
    limit: 7,
  });
  const { data: promoData } = useHomePromotions();
  const { data: scholarsData, isLoading: scholarsLoading } = useInfiniteScholarsList();

  const activeContinueListeningItem = useMemo(() => {
    if (currentTrack) {
      return {
        id: currentTrack.id ?? currentTrack.slug ?? "active-track",
        slug: currentTrack.slug ?? currentTrack.id ?? "active-track",
        title: currentTrack.title,
        scholarName: currentTrack.artist ?? "Scholar",
        progressPercent: 0,
      };
    }
    if (recentProgress) {
      return {
        id: recentProgress.lectureSlug,
        slug: recentProgress.lectureSlug,
        title: recentProgress.lectureTitle,
        scholarName: recentProgress.scholarName,
        progressPercent:
          recentProgress.durationSeconds > 0
            ? recentProgress.positionSeconds / recentProgress.durationSeconds
            : 0,
      };
    }
    return null;
  }, [currentTrack, recentProgress]);

  const rawFeedItems = useMemo(() => feedData?.pages.flatMap((p) => p.items) ?? [], [feedData]);

  const rawScholarsItems = useMemo(
    () => scholarsData?.pages.flatMap((p) => p.items) ?? [],
    [scholarsData],
  );

  // Scholars list for "Study with a scholar" section
  const scholarsList = useMemo(() => {
    if (scholarsLoading && rawScholarsItems.length === 0) return [];
    const source = rawScholarsItems.length > 0 ? rawScholarsItems : FALLBACK_SCHOLARS;
    return source.slice(0, 5).map((s: any) => ({
      id: s.id ?? s.slug,
      slug: s.slug,
      name: s.name,
      initials: s.initials,
      imageUrl: s.imageUrl ?? s.avatarUrl ?? s.image,
      lectureCount: s.totalListingsCount ?? s.lectureCount ?? 12,
    }));
  }, [rawScholarsItems, scholarsLoading]);

  // Feed content items for "Recently added"
  const rawRecentLectures = useMemo(() => {
    if (feedLoading && rawFeedItems.length === 0) return [];
    const feedContentItems = rawFeedItems.filter(
      (item) => item.kind !== "scholar_row" && item.kind !== "topic_row",
    );
    return feedContentItems.map((item: any) => ({
      id: item.id ?? item.slug,
      slug: item.slug ?? item.id,
      title: item.title ?? item.name,
      scholarName: item.scholarName ?? item.scholar?.name ?? "Scholar",
      category: item.categoryName ?? item.topicName ?? item.category ?? "Audio",
      lessonsCount: item.trackCount ?? item.lessonsCount ?? 1,
      completedLessonsCount: 0,
      dateFormatted: item.formattedDate ?? item.publishedAt ?? item.dateFormatted ?? undefined,
    }));
  }, [rawFeedItems, feedLoading]);

  // Show all recently added lectures (no local category filter — category chips navigate to Explore)
  const recentLectures = rawRecentLectures;

  const featuredItem = promoData?.hero?.listing
    ? {
        id: promoData.hero.listing.id,
        slug: promoData.hero.listing.slug,
        title: promoData.hero.listing.title,
        scholarName: promoData.hero.listing.scholarName,
      }
    : (rawRecentLectures[0] ?? null);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setQuery(text);
    },
    [setQuery],
  );

  const isSearching = searchQuery.trim().length > 0;

  const handleSelectListing = useCallback(
    (slug: string) => {
      if (onNavigateToListing) {
        onNavigateToListing(slug);
      } else {
        navigateToListing(slug);
      }
    },
    [onNavigateToListing, navigateToListing],
  );

  const handleSelectScholar = useCallback(
    (slug: string) => {
      if (onNavigateToScholar) {
        onNavigateToScholar(slug);
      } else {
        router.push(routes.scholars.detail(slug) as Href);
      }
    },
    [onNavigateToScholar, router],
  );

  const renderSearchResultItem = useCallback(
    (item: any) => (
      <SearchResultItem
        title={item.title}
        scholarName={item.scholarName}
        imageUrl={item.imageUrl}
        lectureCount={item.lectureCount}
        durationSeconds={item.durationSeconds}
        onPress={() => handleSelectListing(item.slug)}
      />
    ),
    [handleSelectListing],
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Home" searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <View style={[styles.mainContent, isSearching && styles.hidden]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.scrollInner}>
            {/* Hero Section */}
            <HeroSection
              continueListeningItem={activeContinueListeningItem}
              featuredItem={featuredItem}
              onPress={handleSelectListing}
            />

            {/* Quick Action Pills: All Lectures, Scholars, Saved */}
            <QuickActionsRow
              onNavigateToAllLectures={() => router.push("/explore/all" as Href)}
              onNavigateToScholars={() => router.push("/explore/scholar" as Href)}
              onNavigateToSaved={() => router.push("/library" as Href)}
            />

            {/* Category browse chips — navigate to Explore > All with that topic */}
            <CategoryChipsRail
              selectedCategory=""
              onSelectCategory={() => router.push("/explore/all" as Href)}
            />

            {/* Scholars Rail: Study with a scholar */}
            <ScholarMedallionsRail
              scholars={scholarsList}
              onSelectScholar={handleSelectScholar}
              onSeeAllScholars={() => router.push("/explore/scholar" as Href)}
            />

            {/* Recently Added Section */}
            <RecentlyAddedSection
              items={recentLectures}
              onSelectLecture={handleSelectListing}
              onSeeAllRecent={() => router.push("/explore/recent" as Href)}
            />

            {/* Curated collections teaser */}
            <CuratedCollectionsBanner onPress={() => router.push("/explore/curation" as Href)} />
          </View>
        </ScrollView>
      </View>

      <View style={[styles.searchResults, !isSearching && styles.hidden]}>
        {shouldSearch ? (
          <View style={styles.searchFilter}>
            <SearchFilter value={filter} onChange={setFilter} topics={topics} />
          </View>
        ) : null}
        <SearchResultsList
          items={items}
          isFetching={isFetching}
          shouldSearch={shouldSearch}
          errorMessage={errorMessage}
          renderItem={renderSearchResultItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.canvas,
  },
  mainContent: {
    flex: 1,
  },
  hidden: {
    display: "none",
  },
  scrollContent: {
    paddingVertical: 4,
  },
  scrollInner: {
    gap: 4,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface.canvas,
  },
  searchFilter: {
    marginVertical: 8,
  },
}));
