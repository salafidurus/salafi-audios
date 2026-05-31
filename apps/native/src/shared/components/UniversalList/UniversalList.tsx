import { useCallback } from "react";
import { FlashList } from "@shopify/flash-list";

export type UniversalListProps<TItem> = {
  items: TItem[];
  keyExtractor: (item: TItem) => string;
  renderItem: (item: TItem) => React.ReactElement | null;
  estimatedItemSize?: number;
  contentContainerStyle?: object;
  itemSeparator?: React.ComponentType;
  emptyComponent?: React.ComponentType;
};

export function UniversalList<TItem>({
  items,
  keyExtractor,
  renderItem,
  estimatedItemSize = 80,
  contentContainerStyle,
  itemSeparator,
  emptyComponent,
}: UniversalListProps<TItem>) {
  const renderFlashItem = useCallback(
    ({ item }: { item: TItem }) => renderItem(item),
    [renderItem],
  );

  return (
    // @ts-expect-error FlashList generic typing has slight incompatibilities in this environment
    <FlashList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderFlashItem}
      estimatedItemSize={estimatedItemSize}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={itemSeparator}
      ListEmptyComponent={emptyComponent}
    />
  );
}
