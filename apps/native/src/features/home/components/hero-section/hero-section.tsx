import React from "react";

import { ContinueListeningCard, type ContinueListeningCardItem } from "./continue-listening-card";
import { FeaturedHeroCard, type FeaturedHeroCardItem } from "./featured-hero-card";

export type HeroSectionProps = {
  continueListeningItem?: ContinueListeningCardItem | null;
  featuredItem?: FeaturedHeroCardItem | null;
  onPress?: (slug: string) => void;
};

export function HeroSection({ continueListeningItem, featuredItem, onPress }: HeroSectionProps) {
  if (continueListeningItem) {
    return <ContinueListeningCard item={continueListeningItem} onPress={onPress} />;
  }

  if (featuredItem) {
    return <FeaturedHeroCard item={featuredItem} onPress={onPress} />;
  }

  return null;
}
