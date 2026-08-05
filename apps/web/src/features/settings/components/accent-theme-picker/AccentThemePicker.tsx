"use client";

import { Check } from "lucide-react";

import { lightWebTheme, type AccentThemeId } from "@/core/styles/theme";
import { ACCENT_PALETTES } from "@/core/styles/theme/variants";

import styles from "./accent-theme-picker.module.css";

interface AccentThemeOption {
  id: AccentThemeId | "system";
  name: string;
  description: string;
  swatches: [string, string, string];
  accent: string;
  onAccent: string;
  isSystem?: boolean;
}

const SYSTEM_OPTION: Omit<AccentThemeOption, "id"> & { id: "system" } = {
  id: "system",
  name: "System",
  description: "Follow your OS preference",
  swatches: [
    lightWebTheme.colors.surface.canvas,
    lightWebTheme.colors.action.primary,
    lightWebTheme.colors.action.secondary,
  ],
  accent: lightWebTheme.colors.action.primary,
  onAccent: lightWebTheme.colors.content.onPrimary,
  isSystem: true,
};

const ACCENT_OPTIONS: AccentThemeOption[] = [
  SYSTEM_OPTION,
  ...Object.entries(ACCENT_PALETTES).map(([id, palette]) => ({
    id: id as AccentThemeId,
    name: palette.label,
    description: palette.description,
    swatches: palette.swatches,
    accent: palette.gold,
    onAccent: palette.onGold,
  })),
];

export type AccentThemePickerValue = "system" | AccentThemeId;

export interface AccentThemePickerProps {
  value: AccentThemePickerValue;
  onChange: (id: AccentThemePickerValue) => void;
  title?: string;
  description?: string;
}

export function AccentThemePicker({ value, onChange, title, description }: AccentThemePickerProps) {
  return (
    <div className={styles.wrap}>
      {(title || description) && (
        <div className={styles.header}>
          {title && <span className={styles.title}>{title}</span>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}
      <div className={styles.list} role="radiogroup" aria-label={title}>
        {ACCENT_OPTIONS.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${option.name} — ${option.description}`}
              onClick={() => onChange(option.id)}
              className={styles.card}
              style={{ borderColor: active ? option.accent : undefined }}
            >
              <div className={styles.topRow}>
                <span className={styles.swatches}>
                  {option.swatches.map((swatch, index) => (
                    <span key={index} className={styles.swatch} style={{ background: swatch }} />
                  ))}
                </span>
                <span className={styles.copy}>
                  <span className={styles.nameRow}>
                    <span className={styles.name}>{option.name}</span>
                    {active && (
                      <span className={styles.check} style={{ background: option.accent }}>
                        <Check size={11} color={option.onAccent} />
                      </span>
                    )}
                  </span>
                  <span className={styles.optionDescription}>{option.description}</span>
                </span>
              </div>
              <div className={styles.previewRow}>
                <span
                  className={styles.previewBtn}
                  style={{ background: option.accent, color: option.onAccent }}
                >
                  Preview
                </span>
                <span className={styles.aaBtn}>Aa</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
