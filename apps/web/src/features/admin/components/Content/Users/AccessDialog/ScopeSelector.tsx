import type { ReactNode } from "react";

import { X } from "lucide-react";

import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/ui/dropdown";

import styles from "./AccessDialog.module.css";

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
  const handleSelect = (id: string) => {
    if (id && !selectedIds.includes(id)) {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((item) => item !== id));
  };

  const optionsMap = new Map(options.map((opt) => [opt.id, opt]));
  const selectedIdsSet = new Set(selectedIds);

  const selectedOptions = selectedIds
    .map((id) => optionsMap.get(id))
    .filter((opt): opt is ScopeOption => !!opt);

  const availableOptions = options.filter((opt) => !selectedIdsSet.has(opt.id));

  return (
    <div className={styles.subSection}>
      <div className={styles.scopeHeaderRow}>
        <span className={styles.subTitle}>{title}</span>
        <div className={styles.scopeDropdownWrapper}>
          {availableOptions.length > 0 ? (
            <Dropdown value="" onValueChange={handleSelect} disabled={disabled}>
              <DropdownTrigger placeholder={placeholder} />
              <DropdownContent searchable>
                {availableOptions.map((opt) => (
                  <DropdownItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
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
