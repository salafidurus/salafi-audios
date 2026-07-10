export interface DropdownItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  highlightedIndex: number;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentId: string;
  items: DropdownItem[];
  registerItem: (value: string, label: string, disabled?: boolean) => () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  disabled?: boolean;
  error?: boolean | string;
}
