import type { ListingContentsDto } from "@sd/core-contracts";
import type { QueueListingRef } from "@sd/domain-audio";

import { buildTrackQueue } from "@sd/domain-audio";
import { useMemo, useRef } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

import { LessonRow } from "../lesson-row/lesson-row";

export type ListingContentViewProps = {
  contents: ListingContentsDto;
  listingRef: QueueListingRef;
  /** Lesson id to scroll to and briefly highlight on mount (e.g. linked in from a redirected sub-listing). */
  highlightItemId?: string;
};

/**
 * Flat lesson list for a top-level Series/Single, or grouped by Module for a
 * Collection. Rendered as one flat sequence of siblings inside a single
 * ScrollView (module headers included) rather than nested per-module
 * containers, so each lesson's `onLayout` y-offset is directly relative to
 * the ScrollView content and anchor-scrolling doesn't need to sum offsets
 * across nesting levels.
 */
export function ListingContentView({
  contents,
  listingRef,
  highlightItemId,
}: ListingContentViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const offsets = useRef<Record<string, number>>({});
  const hasScrolledToHighlight = useRef(false);

  const queue = useMemo(() => buildTrackQueue(listingRef, contents), [listingRef, contents]);

  const handleLayout = (id: string, y: number) => {
    offsets.current[id] = y;
    if (!hasScrolledToHighlight.current && highlightItemId === id && scrollRef.current) {
      hasScrolledToHighlight.current = true;
      scrollRef.current.scrollTo({ y: Math.max(y - 24, 0), animated: true });
    }
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
      {contents.format === "collection"
        ? contents.modules.map((listingModule) => (
            <View key={listingModule.id}>
              <View style={styles.moduleHeader}>
                <AppText variant="titleMd">{listingModule.title}</AppText>
              </View>
              {listingModule.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  item={lesson}
                  queue={queue}
                  highlighted={highlightItemId === lesson.id}
                  onLayout={handleLayout}
                />
              ))}
            </View>
          ))
        : contents.items.map((item) => (
            <LessonRow
              key={item.id}
              item={item}
              queue={queue}
              highlighted={highlightItemId === item.id}
              onLayout={handleLayout}
            />
          ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    paddingBottom: theme.spacing.scale["2xl"],
  },
  moduleHeader: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingTop: theme.spacing.scale.lg,
    paddingBottom: theme.spacing.scale.sm,
  },
}));
