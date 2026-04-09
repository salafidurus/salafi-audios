import React, { Fragment } from "react";

export type UniversalListProps<TItem> = {
  items: TItem[];
  keyExtractor: (item: TItem) => string;
  renderItem: (item: TItem) => React.ReactElement | null;
  contentContainerStyle?: React.CSSProperties;
  itemSeparator?: React.ComponentType;
  emptyComponent?: React.ComponentType;
};

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
        <Fragment key={keyExtractor(item)}>
          {renderItem(item)}
          {ItemSeparator && index < items.length - 1 ? <ItemSeparator /> : null}
        </Fragment>
      ))}
    </div>
  );
}

export { UniversalList as UniversalListWeb };
export type { UniversalListProps as UniversalListWebProps };
