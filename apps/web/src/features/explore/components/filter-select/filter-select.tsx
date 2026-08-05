"use client";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/shared/components/Dropdown";

import styles from "./filter-select.module.css";

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterSelectProps {
  /** Label rendered before the dropdown trigger */
  label: string;
  /** Available options; id "" represents the "All" reset state */
  options: FilterOption[];
  /** Currently selected option id, or "" for no selection */
  value: string;
  /** Fires when a new option is chosen ("" clears the filter) */
  onChange: (value: string) => void;
  /** Whether the options list can be filtered by typing */
  searchable?: boolean;
  /** Label for the "All" option (defaults to translated "All") */
  allLabel?: string;
}

export function FilterSelect({
  label,
  options,
  value,
  onChange,
  searchable = false,
  allLabel,
}: FilterSelectProps) {
  const { t } = useTranslation();
  const resolvedAllLabel = allLabel ?? t("search.filterAll", "All");
  const selectedLabel = options.find((option) => option.id === value)?.label ?? resolvedAllLabel;

  return (
    <div className={styles.group}>
      <span className={styles.label}>{label}</span>
      <Dropdown value={value} onValueChange={onChange} className={styles.dropdown}>
        <DropdownTrigger
          placeholder={resolvedAllLabel}
          ariaLabel={`${label} ${selectedLabel}`}
          className={styles.trigger}
        />
        <DropdownContent searchable={searchable}>
          <DropdownItem value="">{resolvedAllLabel}</DropdownItem>
          {options.map((option) => (
            <DropdownItem key={option.id} value={option.id}>
              {option.label}
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  );
}
