import { ListContainer, type ListContainerProps } from "./native-list-container";
import { ListItem, type ListItemProps } from "./native-list-item";
import { ListItemActions, type ListItemActionsProps } from "./native-list-item-actions";
import { ListItemText } from "./native-list-item-text";

/**
 * Provides the canonical compound list API, keeping row actions and text attached to each item.
 * The implementation delegates layout and row behavior to the migrated list primitives so feature
 * callers cannot accidentally reintroduce the removed legacy component boundary.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the compound declaration is documented above.
export const List = Object.assign(ListContainer, {
  Item: Object.assign(ListItem, {
    Actions: ListItemActions,
    Text: ListItemText,
  }),
});

export { ListContainer, ListItem, ListItemActions, ListItemText };
export type { ListContainerProps, ListItemProps, ListItemActionsProps };
