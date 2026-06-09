import React, { useState, useCallback, useRef } from "react";
import { View, FlatList, Pressable, ViewStyle, LayoutChangeEvent } from "react-native";
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

export function DraggableList<T>({
  data,
  renderItem,
  keyExtractor,
  onDragEnd,
  scrollEnabled = true,
  estimatedItemSize = 60,
  contentContainerStyle,
}: DraggableListProps<T>) {
  const [layouts, setLayouts] = useState<Map<string, ItemLayout>>(new Map());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [reorderedData, setReorderedData] = useState<T[]>(data);
  const draggedItemOffsetY = useSharedValue(0);
  const containerOffsetY = useSharedValue(0);

  const itemHeights = useRef<Map<string, number>>(new Map());
  const flatListRef = useRef<FlatList>(null);

  // Update reorderedData when data changes externally
  React.useEffect(() => {
    setReorderedData(data);
  }, [data]);

  const handleItemLayout = useCallback(
    (index: number, event: LayoutChangeEvent) => {
      const { y, height } = event.nativeEvent.layout;
      const key = keyExtractor(data[index], index);
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

      // Calculate the target index based on the dragged item's position
      let toIndex = fromIndex;
      const draggedKey = keyExtractor(reorderedData[fromIndex], fromIndex);
      const draggedLayout = layouts.get(draggedKey);

      if (draggedLayout) {
        let cumulativeY = 0;
        for (let i = 0; i < reorderedData.length; i++) {
          const key = keyExtractor(reorderedData[i], i);
          const itemHeight = itemHeights.current.get(key) || estimatedItemSize;

          if (draggedLayout.y + draggedLayout.height / 2 < cumulativeY + itemHeight / 2) {
            toIndex = i;
            break;
          }
          cumulativeY += itemHeight;
          toIndex = i;
        }
      }

      // Reorder the data
      if (toIndex !== fromIndex) {
        const newData = [...reorderedData];
        const [draggedItem] = newData.splice(fromIndex, 1);
        newData.splice(toIndex, 0, draggedItem);
        setReorderedData(newData);

        // Call the callback with the new order
        onDragEnd({
          data: newData,
          from: fromIndex,
          to: toIndex,
        });
      }
    },
    [
      activeIndex,
      reorderedData,
      keyExtractor,
      layouts,
      estimatedItemSize,
      draggedItemOffsetY,
      onDragEnd,
    ],
  );

  const renderDraggableItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const isActive = activeIndex === index;
      const key = keyExtractor(item, index);

      const drag = () => {
        handleDragStart(index);
      };

      return (
        <View
          key={key}
          onLayout={(e) => handleItemLayout(index, e)}
          style={{
            opacity: isActive ? 0.5 : 1,
            zIndex: isActive ? 1000 : 0,
          }}
        >
          {renderItem({
            item,
            index,
            drag,
            isActive,
          })}
          {isActive && (
            <Pressable
              onPressOut={() => handleDragEnd(index)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          )}
        </View>
      );
    },
    [activeIndex, keyExtractor, handleDragStart, handleDragEnd, renderItem, handleItemLayout],
  );

  return (
    <FlatList
      ref={flatListRef}
      data={reorderedData}
      renderItem={renderDraggableItem}
      keyExtractor={(item, index) => keyExtractor(item, index)}
      scrollEnabled={scrollEnabled && activeIndex === null}
      contentContainerStyle={contentContainerStyle}
      onScroll={(e) => {
        containerOffsetY.value = e.nativeEvent.contentOffset.y;
      }}
    />
  );
}
