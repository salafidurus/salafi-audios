import type { AccessCapability, AccessTarget } from "@sd/core-contracts";
import type { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Switch as Toggle } from "@/shared/components/ui/switch";

import styles from "./AccessDialog.module.css";
import { ScopeSelector } from "./ScopeSelector";

interface PermissionRowProps {
  title: string;
  description: string;
  target: AccessTarget;
  enabled: boolean;
  capabilities: AccessCapability[];
  selectedCapabilities: { [key in AccessCapability]?: boolean };
  scholarOptions: { slug: string; name: string }[];
  selectedScholars: string[];
  localeOptions: readonly string[];
  selectedLocales: string[];
  saving: boolean;
  onToggleTarget: (enabled: boolean) => void;
  onToggleCapability: (cap: AccessCapability, checked: boolean) => void;
  onUpdateScholars: (slugs: string[]) => void;
  onUpdateLocales: (locales: string[]) => void;
}

export function PermissionRow({
  title,
  description,
  target,
  enabled,
  capabilities,
  selectedCapabilities,
  scholarOptions,
  selectedScholars,
  localeOptions,
  selectedLocales,
  saving,
  onToggleTarget,
  onToggleCapability,
  onUpdateScholars,
  onUpdateLocales,
}: PermissionRowProps): ReactNode {
  const isScholarScoped = ["scholar", "listing", "media", "translation"].includes(target);

  return (
    <div className={styles.row}>
      <Accordion
        type="single"
        collapsible
        defaultValue={enabled ? target : undefined}
        className={styles.permissionAccordion}
      >
        <AccordionItem value={target} className={styles.permissionItem}>
          <div className={styles.rowHeader}>
            <AccordionTrigger className={styles.permissionTrigger}>
              <div className={styles.rowMeta}>
                <div className={styles.rowLabelSection}>
                  <span className={styles.rowTitle}>{title}</span>
                  <span className={styles.rowDesc}>{description}</span>
                </div>
              </div>
            </AccordionTrigger>
            <Toggle
              checked={enabled}
              onChange={onToggleTarget}
              disabled={saving}
              aria-label={`Toggle access for ${title}`}
            />
          </div>

          <AccordionContent
            key={`${target}-${selectedScholars.join(",")}-${selectedLocales.join(",")}`}
          >
            <div className={styles.subPanel}>
              <div className={styles.subSectionRow}>
                <span className={styles.subTitle}>Actions Allowed</span>
                <div className={styles.capabilitiesRow}>
                  {capabilities.map((cap) => (
                    <div key={cap} className={styles.capabilityToggleRow}>
                      <span className={styles.capabilityLabel}>{cap.toUpperCase()}</span>
                      <Toggle
                        checked={!!selectedCapabilities[cap]}
                        onChange={(checked) => onToggleCapability(cap, checked)}
                        disabled={saving}
                        aria-label={`Toggle capability ${cap}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {isScholarScoped && (
                <ScopeSelector
                  title="Allowed Scholars (none means all)"
                  placeholder="Search and select scholars..."
                  options={scholarOptions.map((s) => ({ id: s.slug, name: s.name }))}
                  selectedIds={selectedScholars}
                  onChange={onUpdateScholars}
                  disabled={saving}
                />
              )}

              {target === "translation" && (
                <ScopeSelector
                  title="Allowed Languages"
                  placeholder="Search and select languages..."
                  options={localeOptions.map((l) => ({ id: l, name: l.toUpperCase() }))}
                  selectedIds={selectedLocales}
                  onChange={onUpdateLocales}
                  disabled={saving}
                />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
