"use client";

import { Check } from "lucide-react";

import { lightWebTheme, type AccentThemeId } from "@/core/styles/theme";
import { ACCENT_PALETTES } from "@/core/styles/theme/variants";

import styles from "./accent-theme-picker.module.css";

interface AccentThemeOption {
  id: AccentThemeId;
  name: string;
  description: string;
  swatches: [string, string, string];
  accent: string;
  onAccent: string;
}

const DEFAULT_OPTION: AccentThemeOption = {
  id: "default",
  name: "Default",
  description: "System light & dark",
  swatches: [
    lightWebTheme.colors.surface.canvas,
    lightWebTheme.colors.action.primary,
    lightWebTheme.colors.action.secondary,
  ],
  accent: lightWebTheme.colors.action.primary,
  onAccent: lightWebTheme.colors.content.onPrimary,
};

const ACCENT_OPTIONS: AccentThemeOption[] = [
  DEFAULT_OPTION,
  ...Object.entries(ACCENT_PALETTES).map(([id, palette]) => ({
    id: id as Exclude<AccentThemeId, "default">,
    name: palette.label,
    description: palette.description,
    swatches: palette.swatches,
    accent: palette.gold,
    onAccent: palette.onGold,
  })),
];

export interface AccentThemePickerProps {
  value: AccentThemeId;
  onChange: (id: AccentThemeId) => void;
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
                      <Check size={12} color={option.onAccent} />
                    </span>
                  )}
                </span>
                <span className={styles.optionDescription}>{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
