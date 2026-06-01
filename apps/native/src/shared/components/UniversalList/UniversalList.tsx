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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const FlashListAny = FlashList as any;

  return (
    <FlashListAny
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
