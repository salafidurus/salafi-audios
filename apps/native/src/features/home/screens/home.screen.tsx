import type { Href } from "expo-router";

import { routes } from "@sd/core-contracts";
import { usePlaybackStore } from "@sd/domain-audio";
import { useExploreRecentScreen, useInfiniteScholarsList } from "@sd/domain-content";
import { useContinueListening, useSearchProcessing } from "@sd/domain-search";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { SearchFilter } from "@/features/search/components/SearchFilter/SearchFilter";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { SearchResultsList } from "@/features/search/components/SearchResultsList/SearchResultsList";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { ScreenHeader } from "@/shared/components";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import type { ParchmentLectureCardItem } from "../components/lecture-card/lecture-card";

import { CategoryChipsRail } from "../components/category-chips/category-chips-rail";
import { HeroSection } from "../components/hero-section/hero-section";
import { QuickActionsRow } from "../components/quick-actions/quick-actions-row";
import { RecentlyAddedSection } from "../components/recently-added-section/recently-added-section";
import { ScholarMedallionsRail } from "../components/scholar-medallions/scholar-medallions-rail";

export type HomeScreenProps = {
  onNavigateToListing?: (slug: string) => void;
  onNavigateToScholar?: (slug: string) => void;
};

const CONTINUE_LISTENING_ITEM = {
  id: "signs-prophethood",
  slug: "signs-prophethood",
  title: "The Signs of Prophethood by al-Firyabi",
  scholarName: "Hasan Al-Muhammadi",
  progressPercent: 0.72,
  currentLessonNumber: 4,
  totalLessonsCount: 6,
};

export function HomeScreen({ onNavigateToListing, onNavigateToScholar }: HomeScreenProps) {
  const router = useRouter();
  const { navigateToListing } = useListingNavigation();
  const showOriginal = useShowOriginalContent();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { setQuery, filter, setFilter, topics, items, isFetching, shouldSearch, errorMessage } =
    useSearchProcessing({ prefill: "", showOriginal });

  const currentTrack = usePlaybackStore((s) => s.currentTrack);
  const { recentProgress } = useContinueListening();
  const { data: feedData } = useExploreRecentScreen();
  const { data: scholarsData } = useInfiniteScholarsList();

  const activeContinueListeningItem = currentTrack
    ? {
        id: currentTrack.id ?? currentTrack.slug ?? "active-track",
        slug: currentTrack.slug ?? currentTrack.id ?? "active-track",
        title: currentTrack.title,
        scholarName: currentTrack.artist ?? "Scholar",
        progressPercent: 0,
      }
    : recentProgress
      ? {
          id: recentProgress.lectureSlug,
          slug: recentProgress.lectureSlug,
          title: recentProgress.lectureTitle,
          scholarName: recentProgress.scholarName,
          progressPercent:
            recentProgress.durationSeconds > 0
              ? recentProgress.positionSeconds / recentProgress.durationSeconds
              : 0,
        }
      : CONTINUE_LISTENING_ITEM;

  const rawFeedItems = feedData?.pages.flatMap((p) => p.items) ?? [];
  const rawScholarsItems = scholarsData?.pages.flatMap((p) => p.items) ?? [];

  // Scholars list for "Study with a scholar" section
  const scholarsList = (
    rawScholarsItems.length > 0
      ? rawScholarsItems
      : [
          { id: "1", slug: "uthaymin", name: "Salih al-‘Uthaymin", initials: "M" },
          { id: "2", slug: "fawzan", name: "Fawzan al-Fawzan", initials: "S" },
          { id: "3", slug: "bukhari", name: "AbdirRaheem al-Bukhari", initials: "A" },
          { id: "4", slug: "mabram", name: "bn Mabram", initials: "M" },
        ]
  ).map((s: any) => ({
    id: s.id ?? s.slug,
    slug: s.slug,
    name: s.name,
    initials: s.initials,
    lectureCount: s.totalListingsCount ?? s.lectureCount ?? 12,
  }));

  // Feed content items for "Recently added"
  const feedContentItems = rawFeedItems.filter(
    (item) => item.kind !== "scholar_row" && item.kind !== "topic_row",
  );

  const rawRecentLectures: ParchmentLectureCardItem[] = (
    feedContentItems.length > 0
      ? feedContentItems
      : [
          {
            id: "signs-prophethood",
            slug: "signs-prophethood",
            title: "Sittings on the Tafsir of al-Mufassal Surahs",
            scholarName: "Salih ibn Fawzan al-Fawzan",
            category: "Tafsir",
            dateFormatted: "Aug 3, 2026",
          },
          {
            id: "fiqh-worship",
            slug: "fiqh-worship",
            title: "Summary of the Fiqh of Worship",
            scholarName: "Muhammad ibn Salih al-Uthaymin",
            category: "Fiqh",
            dateFormatted: "Aug 2, 2026",
          },
          {
            id: "four-principles",
            slug: "four-principles",
            title: "The Four Principles",
            scholarName: "Hasan Al-Muhammadi",
            category: "Aqeedah",
            dateFormatted: "Jul 30, 2026",
          },
        ]
  ).map((item: any) => ({
    id: item.id ?? item.slug,
    slug: item.slug ?? item.id,
    title: item.title ?? item.name,
    scholarName: item.scholarName ?? item.scholar?.name ?? "Scholar",
    category: item.categoryName ?? item.topicName ?? item.category ?? "Audio",
    lessonsCount: item.trackCount ?? item.lessonsCount ?? 1,
    completedLessonsCount: 0,
    dateFormatted: item.formattedDate ?? item.publishedAt ?? item.dateFormatted ?? undefined,
  }));

  // Filter lectures by selected category
  const recentLectures =
    selectedCategory === "all"
      ? rawRecentLectures
      : rawRecentLectures.filter((l) => {
          const cat = l.category?.toLowerCase() ?? "";
          const title = l.title.toLowerCase();
          const target = selectedCategory.toLowerCase();
          return cat.includes(target) || title.includes(target);
        });

  const featuredItem = rawRecentLectures[0] ?? null;

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

          {/* Category Filter Chips */}
          <CategoryChipsRail
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
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
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface.canvas,
  },
  searchFilter: {
    marginVertical: 8,
  },
}));
