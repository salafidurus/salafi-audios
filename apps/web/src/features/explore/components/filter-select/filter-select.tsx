"use client";

import { useMemo, useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

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
  const [search, setSearch] = useState("");
  const resolvedAllLabel = allLabel ?? t("search.filterAll", "All");
  const selectedLabel = options.find((option) => option.id === value)?.label ?? resolvedAllLabel;
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query
      ? options.filter((option) => option.label.toLocaleLowerCase().includes(query))
      : options;
  }, [options, search]);

  return (
    <div className={styles.group}>
      <label className={styles.label} htmlFor={`filter-${label}`}>
        {label}
      </label>
      <Select
        value={value || "__all__"}
        onValueChange={(next) => onChange(next === "__all__" ? "" : next)}
      >
        <SelectTrigger
          id={`filter-${label}`}
          className={styles.trigger}
          aria-label={`${label} ${selectedLabel}`}
        >
          <SelectValue placeholder={resolvedAllLabel} />
        </SelectTrigger>
        <SelectContent>
          {searchable && (
            <input
              type="search"
              placeholder={t("search.filterSearch", "Search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
              className="mx-1 mb-1 h-10 w-[calc(100%-0.5rem)] rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("search.filterSearch", "Search")}
            />
          )}
          <SelectItem value="__all__">{resolvedAllLabel}</SelectItem>
          {filteredOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
