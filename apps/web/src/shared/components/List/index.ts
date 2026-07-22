// Import ListContainer from current directory
import { ListContainer, type ListContainerProps } from "./ListContainer";

// Import ListItem from current directory
import { ListItem, type ListItemProps } from "./ListItem";

// Import ListItemActions from current directory
import { ListItemActions, type ListItemActionsProps } from "./ListItemActions";

/**
 * List — Compound component system for standardized item lists.
 *
 * Architecture:
 * - List: container wrapper (flex column layout)
 * - List.Item: individual row (flex row on desktop, flex column on mobile)
 * - List.Item.Actions: action button group (positioned on right desktop/tablet, below content mobile)
 *
 * Example:
 * ```tsx
 * <List>
 *   <List.Item interactive onClick={handleClick}>
 *     <div>Item content</div>
 *     <List.Item.Actions>
 *       <Button>Edit</Button>
 *       <Button>Delete</Button>
 *     </List.Item.Actions>
 *   </List.Item>
 * </List>
 * ```
 *
 * Styling:
 * - All spacing via design tokens: --space-component-gap-*, --space-scale-*
 * - Responsive layout via CSS media queries (max-width: 640px)
 * - No divider separator between content and actions
 * - Orientation control for flexible action stacking (horizontal/vertical per breakpoint)
 */
export const List = Object.assign(ListContainer, {
  Item: Object.assign(ListItem, {
    Actions: ListItemActions,
  }),
});

// Re-export components and types
export { ListContainer, ListItem, ListItemActions };
export type { ListContainerProps, ListItemProps, ListItemActionsProps };
