"use client";

import { X } from "lucide-react";
import styles from "./Search.module.css";

export interface FilterChip {
  /** Unique identifier for the chip */
  id: string;
  /** Display label for the chip */
  label: string;
}

export interface SearchFilterProps {
  /** Array of available filter chips */
  chips: FilterChip[];
  /** Currently selected chip IDs */
  selected: string[];
  /** Fires when a chip is clicked to toggle selection */
  onChipChange: (chipId: string) => void;
  /** Callback when close button is clicked on a chip */
  onChipRemove?: (chipId: string) => void;
  /** Optional className for container */
  className?: string;
  /** Whether to show close button on selected chips (default: true) */
  showCloseButton?: boolean;
}

/**
 * Search.Filter — Standardized filter chip group.
 *
 * Provides:
 * - Selectable filter chips with toggle behavior
 * - Optional close button for removing selections
 * - Visual selection state (background, border, weight changes)
 * - Responsive layout that wraps on smaller screens
 * - Design token spacing and colors
 *
 * Usage:
 * ```tsx
 * const [filters, setFilters] = useState<string[]>([]);
 *
 * <Search.Filter
 *   chips={[
 *     { id: 'category-lectures', label: 'Lectures' },
 *     { id: 'category-articles', label: 'Articles' },
 *   ]}
 *   selected={filters}
 *   onChipChange={(id) => {
 *     setFilters(prev =>
 *       prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
 *     );
 *   }}
 * />
 * ```
 *
 * For search input, pair with Search.Bar to create a complete search UI.
 */
export function SearchFilter({
  chips,
  selected,
  onChipChange,
  onChipRemove,
  className,
  showCloseButton = true,
}: SearchFilterProps) {
  const handleChipClick = (chipId: string) => {
    onChipChange(chipId);
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>, chipId: string) => {
    e.stopPropagation();
    onChipRemove?.(chipId);
  };

  // Convert selected array to Set for O(1) lookup performance
  const selectedSet = new Set(selected);

  return (
    <div className={`${styles.filterContainer} ${className || ""}`}>
      {chips.map((chip) => {
        const isSelected = selectedSet.has(chip.id);
        return (
          <div
            key={chip.id}
            className={`${styles.filterChip} ${isSelected ? styles.selected : ""}`}
          >
            <button
              type="button"
              className={styles.filterChipButton}
              onClick={() => handleChipClick(chip.id)}
              aria-pressed={isSelected}
              aria-label={`Filter by ${chip.label}`}
            >
              <span>{chip.label}</span>
            </button>
            {isSelected && showCloseButton && (
              <button
                type="button"
                className={styles.filterChipClose}
                onClick={(e) => handleRemoveClick(e, chip.id)}
                aria-label={`Remove ${chip.label} filter`}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
