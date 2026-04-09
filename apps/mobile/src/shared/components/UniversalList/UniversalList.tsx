import { FlashList } from "@shopify/flash-list";

export type UniversalListMobileNativeProps<TItem> = {
  items: TItem[];
  keyExtractor: (item: TItem) => string;
  renderItem: (item: TItem) => React.ReactElement | null;
  contentContainerStyle?: object;
  itemSeparator?: React.ComponentType;
  emptyComponent?: React.ComponentType;
};

export function UniversalListMobileNative<TItem>({
  items,
  keyExtractor,
  renderItem,
  contentContainerStyle,
  itemSeparator,
  emptyComponent,
}: UniversalListMobileNativeProps<TItem>) {
  return (
    <FlashList
      data={items}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => renderItem(item)}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={itemSeparator}
      ListEmptyComponent={emptyComponent}
    />
  );
}
