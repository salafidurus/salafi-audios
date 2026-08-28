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

/** Documents this module's responsibility and public boundary. */
interface ScopeOption {
  id: string;
  name: string;
}

interface ScopeSelectorProps {
  title: string;
  placeholder: string;
  options: ScopeOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

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
