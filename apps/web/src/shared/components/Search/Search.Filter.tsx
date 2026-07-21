"use client";

import { X } from "lucide-react";
import { useTranslation } from "@/core/i18n/use-translation";
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
  /** Whether to allow multiple selections (default: false for single-select/radio) */
  multiple?: boolean;
  /** Whether to include an "All" chip that clears all filters (default: true) */
  includeAllOption?: boolean;
}

/**
 * Search.Filter — Standardized filter chip group.
 */
export function SearchFilter({
  chips,
  selected,
  onChipChange,
  onChipRemove,
  className,
  showCloseButton = true,
  includeAllOption = true,
}: SearchFilterProps) {
  const { t } = useTranslation();

  const handleChipClick = (chipId: string) => {
    if (chipId === "all") {
      // "All" chip clears all selections
      selected.forEach((id) => onChipChange(id));
    } else {
      onChipChange(chipId);
    }
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>, chipId: string) => {
    e.stopPropagation();
    // First call the optional remove callback if provided
    onChipRemove?.(chipId);
    // Then deselect the filter using onChipChange to ensure it's removed
    onChipChange(chipId);
  };

  // Convert selected array to Set for O(1) lookup performance
  const selectedSet = new Set(selected);
  // "All" is selected when no other chips are selected
  const isAllSelected = selected.length === 0;

  return (
    <div className={`${styles.filterContainer} ${className || ""}`}>
      {includeAllOption && (
        <div className={`${styles.filterChip} ${isAllSelected ? styles.selected : ""}`}>
          <button
            type="button"
            className={styles.filterChipButton}
            onClick={() => handleChipClick("all")}
            aria-pressed={isAllSelected}
            aria-label={t("search.filterAllAria", "Show all items")}
          >
            <span>{t("search.filterAll", "All")}</span>
          </button>
        </div>
      )}
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
              aria-label={t("search.filterByAria", {
                defaultValue: `Filter by ${chip.label}`,
                label: chip.label,
              })}
            >
              <span>{chip.label}</span>
            </button>
            {isSelected && showCloseButton && (
              <button
                type="button"
                className={styles.filterChipClose}
                onClick={(e) => handleRemoveClick(e, chip.id)}
                aria-label={t("search.filterRemoveAria", {
                  defaultValue: `Remove ${chip.label} filter`,
                  label: chip.label,
                })}
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
