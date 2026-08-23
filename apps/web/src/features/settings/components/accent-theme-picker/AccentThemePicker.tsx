"use client";

import { Check } from "lucide-react";

import { lightWebTheme, type AccentThemeId } from "@/core/styles/theme";
import { ACCENT_PALETTES } from "@/core/styles/theme/variants";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils";

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

const SELECTABLE_ACCENT_THEME_IDS = ["parchment", "midnight"] as const;

const ACCENT_OPTIONS = [
  SYSTEM_OPTION,
  ...SELECTABLE_ACCENT_THEME_IDS.map((id) => {
    const palette = ACCENT_PALETTES[id];
    return {
      id,
      name: palette.label,
      description: palette.description,
      swatches: palette.swatches,
      accent: palette.gold,
      onAccent: palette.onGold,
    };
  }),
] satisfies AccentThemeOption[];

export type AccentThemePickerValue = "system" | AccentThemeId;

export interface AccentThemePickerProps {
  value: AccentThemePickerValue;
  onChange: (id: AccentThemePickerValue) => void;
  title?: string;
  description?: string;
}

export function AccentThemePicker({ value, onChange, title, description }: AccentThemePickerProps) {
  const titleId = title ? "accent-theme-picker-title" : undefined;

  return (
    <div className={styles.wrap}>
      {(title || description) && (
        <div className={styles.header}>
          {title && (
            <span id={titleId} className={styles.title}>
              {title}
            </span>
          )}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}
      <div
        className={styles.list}
        role="radiogroup"
        aria-label={title ? undefined : "Accent theme"}
        aria-labelledby={titleId}
      >
        {ACCENT_OPTIONS.map((option) => {
          const active = option.id === value;
          return (
            <Card
              key={option.id}
              className={cn(
                styles.cardShell,
                "bg-card text-card-foreground",
                active && "ring-2 ring-primary",
              )}
            >
              <button
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${option.name} — ${option.description}`}
                onClick={() => onChange(option.id)}
                className={cn(styles.card, "text-start")}
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
                    style={{
                      background: option.accent,
                      color: option.onAccent,
                    }}
                  >
                    Preview
                  </span>
                  <span className={styles.aaBtn}>Aa</span>
                </div>
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
