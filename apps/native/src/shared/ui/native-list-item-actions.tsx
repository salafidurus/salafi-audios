import type { MenuAction } from "@expo/ui/community/menu";

/** Provides a reusable native UI primitive with a focused rendering contract. */
/** Describes the inputs, callbacks, and optional state accepted by List Item Actions. */
export type ListItemActionsProps = {
  /** Actions shown in the native menu opened by long-pressing the row. */
  actions: MenuAction[];
  /** Called with the pressed action's `id` (falling back to its `title`). */
  onAction: (id: string) => void;
};

/**
 * Data-only marker rendered as a child of `List.Item` (mirrors `@expo/ui`'s own
 * `Picker.Item` pattern). Renders nothing itself — `ListItem` reads its
 * `actions`/`onAction` and uses them to wrap the row in a native long-press
 * menu (SwiftUI `ContextMenu`, Compose `DropdownMenu`).
 */
export function ListItemActions(_props: ListItemActionsProps) {
  return null;
}
