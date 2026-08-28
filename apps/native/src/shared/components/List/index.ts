import { ListContainer, type ListContainerProps } from "./ListContainer";
import { ListItem, type ListItemProps } from "./ListItem";
import { ListItemActions, type ListItemActionsProps } from "./ListItemActions";

/** Provides the native shared components List index module responsibility. */
/** Describes the const List = Object.assign(ListContainer, { native declaration contract and behavior. */
export const List = Object.assign(ListContainer, {
  Item: Object.assign(ListItem, {
    Actions: ListItemActions,
  }),
});

export { ListContainer, ListItem, ListItemActions };
export type { ListContainerProps, ListItemProps, ListItemActionsProps };
