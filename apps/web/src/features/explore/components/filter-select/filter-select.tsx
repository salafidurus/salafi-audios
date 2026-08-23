"use client";

import { ExploreFilterField } from "../explore-filter-field/explore-filter-field";

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterSelectProps {
  /** Stable DOM id for the field */
  id?: string;
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
  id = "explore-filter",
  label,
  options,
  value,
  onChange,
  searchable = false,
  allLabel,
}: FilterSelectProps) {
  return (
    <ExploreFilterField
      id={id}
      label={label}
      options={options}
      value={value}
      mode={searchable ? "combobox" : "select"}
      allLabel={allLabel ?? "All"}
      searchPlaceholder="Search"
      emptyLabel="No options found"
      onChange={onChange}
    />
  );
}
