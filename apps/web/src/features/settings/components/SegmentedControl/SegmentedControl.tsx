/** Documents this module's responsibility and public boundary. */
"use client";

import styles from "./segmented-control.module.css";

/** One selectable value in the settings segmented control. */
export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

/** Options, selected value, and change callback for a segmented control. */
export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible label for the control group */
  ariaLabel?: string;
}

/** Renders mutually exclusive options and reports the selected value on activation. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.container} role="group" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.segment}${opt.value === value ? ` ${styles.active}` : ""}`}
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
