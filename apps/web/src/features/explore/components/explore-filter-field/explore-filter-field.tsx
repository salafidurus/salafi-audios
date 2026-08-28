"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import type { FilterOption } from "../filter-select/filter-select";

import styles from "./explore-filter-field.module.css";

export type ExploreFilterFieldMode = "select" | "combobox";

export type ExploreFilterFieldProps = {
  id: string;
  label: string;
  options: readonly FilterOption[];
  value: string;
  mode?: ExploreFilterFieldMode;
  allLabel: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  onChange: (value: string) => void;
};

type ExploreOption = FilterOption & { id: string };

function ComboboxField({
  id,
  label,
  items,
  selectedOption,
  selectedLabel,
  searchPlaceholder,
  emptyLabel,
  value,
  allLabel,
  onChange,
}: {
  id: string;
  label: string;
  items: ExploreOption[];
  selectedOption: FilterOption | undefined;
  selectedLabel: string;
  searchPlaceholder: string;
  emptyLabel: string;
  value: string;
  allLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <Combobox
      items={items}
      value={selectedOption ?? null}
      onValueChange={(next) => onChange(next?.id ?? "")}
      itemToStringValue={(item) => item?.label ?? allLabel}
    >
      <ComboboxInput
        id={id}
        aria-label={label}
        placeholder={selectedLabel === allLabel ? searchPlaceholder : selectedLabel}
        showClear={Boolean(value)}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id || "all"} value={item} aria-label={item.label}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function SelectField({
  id,
  label,
  options,
  value,
  selectedLabel,
  allLabel,
  onChange,
}: {
  id: string;
  label: string;
  options: readonly FilterOption[];
  value: string;
  selectedLabel: string;
  allLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value || "__all__"}
      onValueChange={(next) => onChange(next === "__all__" ? "" : next)}
    >
      <SelectTrigger id={id} aria-label={`${label}: ${selectedLabel}`}>
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="__all__">{allLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function ExploreFilterField({
  id,
  label,
  options,
  value,
  mode = "select",
  allLabel,
  searchPlaceholder = allLabel,
  emptyLabel = allLabel,
  onChange,
}: ExploreFilterFieldProps) {
  const selectedOption = options.find((option) => option.id === value);
  const selectedLabel = selectedOption?.label ?? allLabel;
  const items: ExploreOption[] = [{ id: "", label: allLabel }, ...options];

  return (
    <Field className={styles.field}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {mode === "combobox" ? (
        <ComboboxField
          id={id}
          label={label}
          items={items}
          selectedOption={selectedOption}
          selectedLabel={selectedLabel}
          searchPlaceholder={searchPlaceholder}
          emptyLabel={emptyLabel}
          value={value}
          allLabel={allLabel}
          onChange={onChange}
        />
      ) : (
        <SelectField
          id={id}
          label={label}
          options={options}
          value={value}
          selectedLabel={selectedLabel}
          allLabel={allLabel}
          onChange={onChange}
        />
      )}
    </Field>
  );
}
