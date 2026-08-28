import { ListContainer, type ListContainerProps } from "./ListContainer";
import { ListItem, type ListItemProps } from "./ListItem";
import { ListItemActions, type ListItemActionsProps } from "./ListItemActions";

/** Provides a reusable native UI primitive with a focused rendering contract. */
/** Exposes the list container and item primitives as one reusable native list API. */
export const List = Object.assign(ListContainer, {
  Item: Object.assign(ListItem, {
    Actions: ListItemActions,
  }),
});

export { ListContainer, ListItem, ListItemActions };
export type { ListContainerProps, ListItemProps, ListItemActionsProps };
