import type { ViewStyle, LayoutChangeEvent } from "react-native";

import React, { useState, useCallback, useRef } from "react";
import { View, FlatList, Pressable, Text } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export interface RenderItemParams<T> {
  item: T;
  index: number;
  drag: () => void;
  isActive: boolean;
}

type DraggableListRowProps = {
  title: string;
  supportingText: string;
  drag: () => void;
  isActive: boolean;
  testID?: string;
};

/**
 * React Native row intentionally kept inside the approved reorder bridge.
 * Expo UI hosts the surrounding screen while this row preserves drag behavior.
 */
export function DraggableListRow({
  title,
  supportingText,
  drag,
  isActive,
  testID,
}: DraggableListRowProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      onLongPress={drag}
      style={[
        sortableRowStyles.row,
        {
          backgroundColor: isActive
            ? theme.colors.surface.primarySubtle
            : theme.colors.surface.default,
          borderColor: isActive ? theme.colors.border.primary : theme.colors.border.subtle,
          opacity: isActive ? 0.9 : 1,
        },
      ]}
      testID={testID}
    >
      <Text style={[sortableRowStyles.title, { color: theme.colors.content.strong }]}>{title}</Text>
      <Text style={[sortableRowStyles.supportingText, { color: theme.colors.content.muted }]}>
        {supportingText}
      </Text>
    </Pressable>
  );
}

interface DraggableListProps<T> {
  data: T[];
  renderItem: (params: RenderItemParams<T>) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onDragEnd: (params: { data: T[]; from: number; to: number }) => void;
  scrollEnabled?: boolean;
  estimatedItemSize?: number;
  contentContainerStyle?: ViewStyle;
}

interface ItemLayout {
  index: number;
  y: number;
  height: number;
}

interface DraggableItemProps<T> {
  item: T;
  index: number;
  isActive: boolean;
  keyExtractor: (item: T, index: number) => string;
  renderItem: (params: RenderItemParams<T>) => React.ReactElement;
  onLayout: (index: number, event: LayoutChangeEvent) => void;
  onDragStart: (index: number) => void;
  onDragEnd: (index: number) => void;
}

function DraggableItemRenderer<T>({
  item,
  index,
  isActive,
  renderItem,
  onLayout,
  onDragStart,
  onDragEnd,
}: DraggableItemProps<T>) {
  const drag = useCallback(() => onDragStart(index), [onDragStart, index]);
  return (
    <View
      onLayout={(e) => onLayout(index, e)}
      style={[draggableStyles.item, { opacity: isActive ? 0.5 : 1, zIndex: isActive ? 1000 : 0 }]}
    >
      {/* react-doctor-disable-next-line react-doctor/no-render-in-render */}
      {renderItem({ item, index, drag, isActive })}
      {isActive && (
        <Pressable onPressOut={() => onDragEnd(index)} style={draggableStyles.overlay} />
      )}
    </View>
  );
}

const draggableStyles = StyleSheet.create({
  item: {},
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

const sortableRowStyles = StyleSheet.create((theme) => ({
  row: {
    gap: theme.spacing.scale.xs,
    padding: theme.spacing.component.cardPadding,
    marginBottom: theme.spacing.component.gapSm,
    borderWidth: theme.border.width.default,
    borderRadius: theme.radius.component.card,
  },
  title: {
    ...theme.typography.bodyMd,
    fontWeight: "600",
  },
  supportingText: {
    ...theme.typography.caption,
  },
}));

export function DraggableList<T>({
  data,
  renderItem,
  keyExtractor,
  onDragEnd,
  scrollEnabled = true,
  estimatedItemSize = 60,
  contentContainerStyle,
}: DraggableListProps<T>) {
  const [layouts, setLayouts] = useState<Map<string, ItemLayout>>(() => new Map());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const draggedItemOffsetY = useSharedValue(0);
  const containerOffsetY = useSharedValue(0);

  // react-doctor-disable-next-line react-doctor/rerender-lazy-ref-init
  const itemHeights = useRef(new Map<string, number>());
  const flatListRef = useRef<FlatList>(null);

  const handleItemLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { y, height } = event.nativeEvent.layout;
      const key = keyExtractor(data[index]!, index);
      itemHeights.current.set(key, height);

      const newLayouts = new Map(layouts);
      newLayouts.set(key, { index, y, height });
      setLayouts(newLayouts);
    },
    [data, keyExtractor, layouts],
  );

  const handleDragStart = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleDragEnd = useCallback(
    (fromIndex: number) => {
      if (activeIndex === null) return;

      setActiveIndex(null);
      // Reanimated shared values are designed to be mutated via `.value`; the
      // React Compiler immutability rule can't see that opt-out and false-positives here.
      // eslint-disable-next-line react-hooks/immutability
      draggedItemOffsetY.value = 0;

      let toIndex = fromIndex;
      const draggedKey = keyExtractor(data[fromIndex]!, fromIndex);
      const draggedLayout = layouts.get(draggedKey);

      if (draggedLayout) {
        let cumulativeY = 0;
        for (let i = 0; i < data.length; i++) {
          const key = keyExtractor(data[i]!, i);
          const itemHeight = itemHeights.current.get(key) || estimatedItemSize;

          if (draggedLayout.y + draggedLayout.height / 2 < cumulativeY + itemHeight / 2) {
            toIndex = i;
            break;
          }
          cumulativeY += itemHeight;
          toIndex = i;
        }
      }

      if (toIndex !== fromIndex) {
        const newData = [...data];
        const [draggedItem] = newData.splice(fromIndex, 1);
        newData.splice(toIndex, 0, draggedItem!);

        onDragEnd({
          data: newData,
          from: fromIndex,
          to: toIndex,
        });
      }
    },
    [activeIndex, data, keyExtractor, layouts, estimatedItemSize, draggedItemOffsetY, onDragEnd],
  );

  const renderDraggableItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <DraggableItemRenderer
        item={item}
        index={index}
        isActive={activeIndex === index}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onLayout={handleItemLayout}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />
    ),
    [activeIndex, keyExtractor, renderItem, handleItemLayout, handleDragStart, handleDragEnd],
  );

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderDraggableItem}
      keyExtractor={keyExtractor}
      scrollEnabled={scrollEnabled && activeIndex === null}
      contentContainerStyle={contentContainerStyle}
      onScroll={(e) => {
        containerOffsetY.value = e.nativeEvent.contentOffset.y;
      }}
    />
  );
}
