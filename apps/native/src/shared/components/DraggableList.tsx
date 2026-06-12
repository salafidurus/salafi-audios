import React, { useState, useCallback, useRef } from "react";
import { View, FlatList, Pressable, StyleSheet } from "react-native";
import type { ViewStyle, LayoutChangeEvent } from "react-native";
import { useSharedValue } from "react-native-reanimated";

export interface RenderItemParams<T> {
  item: T;
  index: number;
  drag: () => void;
  isActive: boolean;
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
