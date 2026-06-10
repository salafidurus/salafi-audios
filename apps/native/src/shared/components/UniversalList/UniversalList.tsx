import { useCallback } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { FlashList } from "@shopify/flash-list";

export type UniversalListProps<TItem> = {
  items: TItem[];
  keyExtractor: (item: TItem) => string;
  renderItem: (item: TItem) => React.ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  itemSeparator?: React.ComponentType;
  emptyComponent?: React.ComponentType;
};

export function UniversalList<TItem>({
  items,
  keyExtractor,
  renderItem,
  contentContainerStyle,
  itemSeparator,
  emptyComponent,
}: UniversalListProps<TItem>) {
  const renderFlashItem = useCallback(
    ({ item }: { item: TItem }) => renderItem(item),
    [renderItem],
  );

  return (
    <FlashList<TItem>
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderFlashItem}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={itemSeparator}
      ListEmptyComponent={emptyComponent}
    />
  );
}
