import React, { Fragment } from "react";

export type UniversalListProps<TItem> = {
  items: TItem[];
  keyExtractor: (item: TItem) => string;
  renderItem: (item: TItem) => React.ReactElement | null;
  contentContainerStyle?: React.CSSProperties;
  itemSeparator?: React.ComponentType;
  emptyComponent?: React.ComponentType;
};

type ItemRendererProps<TItem> = {
  item: TItem;
  index: number;
  total: number;
  renderItem: (item: TItem) => React.ReactElement | null;
  ItemSeparator?: React.ComponentType;
};

function ItemRenderer<TItem>({
  item,
  index,
  total,
  renderItem,
  ItemSeparator,
}: ItemRendererProps<TItem>) {
  return (
    <>
      {/* react-doctor-disable-next-line react-doctor/no-render-in-render */}
      {renderItem(item)}
      {ItemSeparator && index < total - 1 ? <ItemSeparator /> : null}
    </>
  );
}

export function UniversalList<TItem>({
  items,
  keyExtractor,
  renderItem,
  contentContainerStyle,
  itemSeparator: ItemSeparator,
  emptyComponent: EmptyComponent,
}: UniversalListProps<TItem>) {
  if (items.length === 0) {
    return EmptyComponent ? <EmptyComponent /> : null;
  }

  return (
    <div style={contentContainerStyle}>
      {items.map((item, index) => (
        <ItemRenderer
          key={keyExtractor(item)}
          item={item}
          index={index}
          total={items.length}
          renderItem={renderItem}
          ItemSeparator={ItemSeparator}
        />
      ))}
    </div>
  );
}
