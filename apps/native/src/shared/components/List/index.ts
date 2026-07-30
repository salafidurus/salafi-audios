import { ListContainer, type ListContainerProps } from "./ListContainer";
import { ListItem, type ListItemProps } from "./ListItem";
import { ListItemActions, type ListItemActionsProps } from "./ListItemActions";

export const List = Object.assign(ListContainer, {
  Item: Object.assign(ListItem, {
    Actions: ListItemActions,
  }),
});

export { ListContainer, ListItem, ListItemActions };
export type { ListContainerProps, ListItemProps, ListItemActionsProps };
