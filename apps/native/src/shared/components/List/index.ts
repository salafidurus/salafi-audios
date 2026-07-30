import { ListContainer, type ListContainerProps } from "./ListContainer";
import { ListItem, type ListItemProps } from "./ListItem";

export const List = Object.assign(ListContainer, {
  Item: ListItem,
});

export { ListContainer, ListItem };
export type { ListContainerProps, ListItemProps };
