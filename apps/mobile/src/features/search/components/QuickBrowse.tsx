import { View, Text, useWindowDimensions } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { BrowseCard } from "./BrowseCard";
import { breakpoints } from "@/core/styles/breakpoints";
import { EaseView } from "react-native-ease";
import { useEffect, useState } from "react";

const browseCategories = [
  { name: "Senior Scholars", searchKey: "Senior Scholars" },
  { name: "Hadith", searchKey: "Hadith" },
  { name: "Fiqh", searchKey: "Fiqh" },
  { name: "Tafsir", searchKey: "Tafsir" },
  { name: "Arabic", searchKey: "Arabic" },
  { name: "Farah", searchKey: "Farah" },
];

function AnimatedCardWrapper({
  children,
  delay,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  style?: object;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <EaseView
      initialAnimate={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{
        type: "spring",
        damping: 12,
        stiffness: 120,
      }}
      style={style}
    >
      {children}
    </EaseView>
  );
}

export function QuickBrowse() {
  const { theme } = useUnistyles();
  const { width } = useWindowDimensions();
  const numColumns = width >= breakpoints.md ? 4 : 2;
  const [isVisible, setIsVisible] = useState(false);

  // Explicit grid math: total gap width divided equally across cards.
  // (numColumns - 1) gaps of gapMd, plus 2×xs gutters from the card wrapper,
  // subtracted from 100% before dividing by column count.
  const totalGapPercent = (((numColumns - 1) * theme.spacing.component.gapMd) / width) * 100;
  const cardWidthPercent = (96 - totalGapPercent) / numColumns;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <EaseView
        initialAnimate={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: isVisible ? 1 : 0, translateX: isVisible ? 0 : -20 }}
        transition={{ type: "spring", damping: 12, stiffness: 100 }}
      >
        <Text style={styles.header}>Browse all</Text>
      </EaseView>
      <View style={[styles.grid, { gap: theme.spacing.component.gapMd }]}>
        {browseCategories.map((category, index) => (
          <AnimatedCardWrapper
            key={category.name}
            delay={index * 50}
            style={[styles.cardWrapper, { width: `${cardWidthPercent}%` }]}
          >
            <BrowseCard name={category.name} />
          </AnimatedCardWrapper>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {},
  header: {
    fontFamily: theme.typography.titleMd.fontFamily,
    fontSize: theme.typography.titleMd.fontSize,
    lineHeight: theme.typography.titleMd.lineHeight,
    letterSpacing: theme.typography.titleMd.letterSpacing,
    color: theme.colors.content.strong,
    marginBottom: theme.spacing.component.gapMd,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardWrapper: {
    padding: theme.spacing.scale.xs,
  },
}));
