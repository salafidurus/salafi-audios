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
  return (
    <FlashList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => renderItem(item)}
      estimatedItemSize={estimatedItemSize}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={itemSeparator}
      ListEmptyComponent={emptyComponent}
    />
  );
}
