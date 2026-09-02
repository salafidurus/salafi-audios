import type { ReactNode } from "react";

import { X } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/shared/components/ui/combobox";

import styles from "./AccessDialog.module.css";

/** One selectable resource scope in the access-management dialog. */
interface ScopeOption {
  /** Stable resource identifier submitted with the access grant. */
  id: string;
  /** Human-readable resource name shown in the selector and chips. */
  name: string;
}

/** Controlled selection state for a resource-scope combobox. */
interface ScopeSelectorProps {
  /** Section heading and accessible label for the selector. */
  title: string;
  /** Empty-input guidance shown by the combobox. */
  placeholder: string;
  /** Resource scopes that may be selected. */
  options: ScopeOption[];
  /** Currently selected resource identifiers. */
  selectedIds: string[];
  /** Replaces the selected resource identifiers after add/remove actions. */
  onChange: (selectedIds: string[]) => void;
  /** Prevents adding or removing scopes while the parent operation is busy. */
  disabled?: boolean;
}

/** Renders addable resource scopes and removable selected-scope chips. */
export function ScopeSelector({
  title,
  placeholder,
  options,
  selectedIds,
  onChange,
  disabled,
}: ScopeSelectorProps): ReactNode {
  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((item) => item !== id));
  };

  const handleSelect = (id: string) => {
    if (id && !selectedIds.includes(id)) {
      onChange([...selectedIds, id]);
    }
  };

  const optionsMap = new Map(options.map((opt) => [opt.id, opt]));
  const selectedIdsSet = new Set(selectedIds);

  const selectedOptions = selectedIds
    .filter(Boolean)
    .map((id) => optionsMap.get(id) ?? { id, name: id });

  const availableOptions = options.filter((option) => !selectedIdsSet.has(option.id));
  const availableIds = availableOptions.map((option) => option.id);
  const optionName = (id: string) => optionsMap.get(id)?.name ?? id;

  return (
    <div className={styles.subSection}>
      <div className={styles.scopeHeaderRow}>
        <span className={styles.subTitle}>{title}</span>
        <div className={styles.scopeDropdownWrapper}>
          {availableOptions.length > 0 ? (
            <Combobox
              items={availableIds}
              onValueChange={(id) => handleSelect(id ?? "")}
              itemToStringLabel={optionName}
              itemToStringValue={optionName}
              disabled={disabled}
            >
              <ComboboxInput aria-label={title} placeholder={placeholder} showTrigger />
              <ComboboxContent>
                <ComboboxEmpty>No matching options.</ComboboxEmpty>
                <ComboboxList>
                  {(id) => (
                    <ComboboxItem key={id} value={id} aria-label={optionName(id)}>
                      {optionName(id)}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          ) : (
            <p className={styles.allSelectedText}>All options selected.</p>
          )}
        </div>
      </div>

      {selectedOptions.length > 0 && (
        <div className={styles.chipContainer}>
          {selectedOptions.map((opt) => (
            <span key={opt.id} className={styles.chip}>
              {opt.name}
              <button
                type="button"
                className={styles.chipRemoveButton}
                onClick={() => handleRemove(opt.id)}
                disabled={disabled}
                aria-label={`Remove ${opt.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
