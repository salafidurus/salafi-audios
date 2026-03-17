import { useEffect, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { EaseView } from "react-native-ease";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { BrowseCard } from "../BrowseCard";

const browseCategories = [
  { name: "Senior Scholars", searchKey: "Senior Scholars" },
  { name: "Hadith", searchKey: "Hadith" },
  { name: "Fiqh", searchKey: "Fiqh" },
  { name: "Tafsir", searchKey: "Tafsir" },
  { name: "Arabic", searchKey: "Arabic" },
  { name: "Farah", searchKey: "Farah" },
] as const;

const TABLET_BREAKPOINT = 768;

export type QuickBrowseProps = {
  onSelectCategory?: (searchKey: string) => void;
};

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

export function QuickBrowse({ onSelectCategory }: QuickBrowseProps) {
  const { theme } = useUnistyles();
  const { width } = useWindowDimensions();
  const numColumns = width >= TABLET_BREAKPOINT ? 4 : 2;
  const [isVisible, setIsVisible] = useState(false);

  const totalGapPercent = (((numColumns - 1) * theme.spacing.component.gapMd) / width) * 100;
  const cardWidthPercent = (96 - totalGapPercent) / numColumns;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View>
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
            <BrowseCard
              name={category.name}
              onPress={() => onSelectCategory?.(category.searchKey)}
            />
          </AnimatedCardWrapper>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    ...theme.typography.titleMd,
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
