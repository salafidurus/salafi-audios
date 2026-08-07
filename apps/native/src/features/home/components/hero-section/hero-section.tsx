import type { ViewStyle } from "react-native";

import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Skeleton } from "@/shared/components/Skeleton/Skeleton";

import { ContinueListeningCard, type ContinueListeningCardItem } from "./continue-listening-card";
import { FeaturedHeroCard, type FeaturedHeroCardItem } from "./featured-hero-card";

export type HeroSectionProps = {
  continueListeningItem?: ContinueListeningCardItem | null;
  featuredItem?: FeaturedHeroCardItem | null;
  onPress?: (slug: string) => void;
  isLoading?: boolean;
};

/** Shown to brand-new users when there is no listening history and the
 *  promo feed hasn't loaded yet. Mirrors the prototype's first-time hero. */
const WELCOME_HERO_ITEM: FeaturedHeroCardItem = {
  id: "welcome-nullifiers",
  slug: "nullifiers-of-islam",
  title: "Nullifiers of Islam",
  scholarName: "Shaykh Salih al-Fawzan",
  badgeText: "NEW HERE? START WITH THE BASICS",
};

export function HeroSection({
  continueListeningItem,
  featuredItem,
  onPress,
  isLoading,
}: HeroSectionProps) {
  if (isLoading) {
    return <HeroSkeleton />;
  }

  if (continueListeningItem) {
    return <ContinueListeningCard item={continueListeningItem} onPress={onPress} />;
  }

  const heroItem = featuredItem ?? WELCOME_HERO_ITEM;
  return <FeaturedHeroCard item={heroItem} onPress={onPress} />;
}

function HeroSkeleton() {
  return (
    <View style={styles.skeletonContainer} testID="hero-skeleton">
      <View style={styles.skeletonRow}>
        <Skeleton width={20} height={20} borderRadius={4} style={styles.skeletonBadge} />
        <Skeleton width={140} height={14} style={styles.skeletonTitle} />
      </View>
      <Skeleton width="60%" height={20} style={styles.skeletonLine} />
      <Skeleton width="40%" height={16} style={styles.skeletonLine} />
      <Skeleton width={120} height={40} borderRadius={20} style={styles.skeletonCta} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  skeletonContainer: {
    backgroundColor: theme.colors.surface.default,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    gap: 12,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skeletonBadge: {
    opacity: 0.5,
  },
  skeletonTitle: {
    opacity: 0.5,
  },
  skeletonLine: {
    opacity: 0.5,
  },
  skeletonCta: {
    opacity: 0.5,
    marginTop: 4,
    alignSelf: "flex-start",
  },
}));

export function ActivityLoader({ style }: { style?: ViewStyle }) {
  return <ActivityIndicator style={style} />;
}
