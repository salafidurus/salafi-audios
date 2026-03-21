"use client";

import { useState, type CSSProperties } from "react";
import {
  Bookmark,
  CheckCircle,
  CircleCheck,
  Clock,
  Cloud,
  Flame,
  Heart,
  Mic,
  Play,
  Radio,
  Scale,
  Search,
  Settings,
  SlidersHorizontal,
  User,
  CassetteTape,
  type LucideIcon,
} from "lucide-react";
import { SECTION_LABELS, SECTION_TABS } from "../../types";
import type { ActiveNavigationState, Section } from "../../types";

type AdaptiveShellProps = {
  blurTargetRef?: unknown;
  shellState: ActiveNavigationState;
  onSelectSection: (target: Section | "home") => void;
  onTabChange: (tabId: string) => void;
};

const SECTION_ICONS: Record<Section, LucideIcon> = {
  feed: Cloud,
  live: Mic,
  library: CassetteTape,
  account: Settings,
};

const TAB_ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  clock: Clock,
  heart: Heart,
  calendar: Radio,
  radio: Radio,
  "circle-check": CircleCheck,
  bookmark: Bookmark,
  play: Play,
  "check-circle": CheckCircle,
  user: User,
  "sliders-horizontal": SlidersHorizontal,
  scale: Scale,
};

const SECTION_ORDER: Section[] = ["feed", "live", "library", "account"];

const shellStyle: CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  padding: "0.5rem var(--space-layout-page-x)",
  zIndex: 30,
  pointerEvents: "none",
};

const panelStyle: CSSProperties = {
  minHeight: "4.5rem",
  borderRadius: "var(--radius-component-panel)",
  background: "var(--surface-elevated)",
  border: "1px solid var(--border-subtle)",
  boxShadow: "var(--shadow-lg)",
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  padding: "0.5rem 0.75rem calc(0.5rem + env(safe-area-inset-bottom, 0px))",
  pointerEvents: "auto",
};

const launcherButtonStyle: CSSProperties = {
  flex: 1,
  minHeight: "3.25rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.2rem",
  border: "none",
  background: "transparent",
  color: "var(--content-muted)",
};

const iconButtonStyle: CSSProperties = {
  width: "2.75rem",
  height: "2.75rem",
  borderRadius: "var(--radius-component-chip)",
  border: "none",
  background: "transparent",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const menuStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  bottom: "3.4rem",
  minWidth: "10rem",
  borderRadius: "var(--radius-component-panel)",
  background: "var(--surface-elevated)",
  border: "1px solid var(--border-subtle)",
  boxShadow: "var(--shadow-lg)",
  padding: "0.4rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const menuItemStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  borderRadius: "var(--radius-component-chip)",
  padding: "0.55rem 0.75rem",
  color: "var(--content-primary)",
};

const tabGroupStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.25rem",
};

const tabButtonStyle: CSSProperties = {
  minHeight: "2.5rem",
  border: "none",
  background: "transparent",
  borderRadius: "var(--radius-component-chip)",
  padding: "0.35rem 0.6rem",
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.1rem",
  color: "var(--content-muted)",
};

export function AdaptiveShell({
  shellState,
  onSelectSection,
  onTabChange,
}: AdaptiveShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (shellState.showSectionLauncher) {
    return (
      <div style={shellStyle}>
        <div style={panelStyle}>
          {SECTION_ORDER.map((section) => {
            const Icon = SECTION_ICONS[section];
            return (
              <button
                key={section}
                type="button"
                aria-label={`Navigate to ${SECTION_LABELS[section]}`}
                onClick={() => onSelectSection(section)}
                style={launcherButtonStyle}
              >
                <Icon size={20} strokeWidth={2} />
                <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{SECTION_LABELS[section]}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!shellState.activeSection || !shellState.activeTab) {
    return null;
  }

  const tabs = SECTION_TABS[shellState.activeSection];
  const ActiveSectionIcon = SECTION_ICONS[shellState.activeSection];

  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            aria-label={`Switch from ${SECTION_LABELS[shellState.activeSection]}`}
            onClick={() => setMenuOpen((current) => !current)}
            style={{ ...iconButtonStyle, color: "var(--content-primary)" }}
          >
            <ActiveSectionIcon size={20} strokeWidth={1.8} />
          </button>

          {menuOpen ? (
            <div style={menuStyle}>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onSelectSection("home");
                }}
                style={{
                  ...menuItemStyle,
                  background: shellState.activeSection === null ? "var(--surface-subtle)" : "transparent",
                  fontWeight: shellState.activeSection === null ? 600 : 500,
                }}
              >
                <Search size={16} strokeWidth={1.8} />
                <span>Home</span>
              </button>

              {SECTION_ORDER.map((section) => {
                const Icon = SECTION_ICONS[section];
                const isActive = section === shellState.activeSection;
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onSelectSection(section);
                    }}
                    style={{
                      ...menuItemStyle,
                      background: isActive ? "var(--surface-subtle)" : "transparent",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                      color={isActive ? "var(--content-primary)" : "currentColor"}
                    />
                    <span>{SECTION_LABELS[section]}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div style={tabGroupStyle} role="tablist" aria-label="Section tabs">
          {tabs.map((tab) => {
            const Icon = TAB_ICONS[tab.icon];
            const isActive = tab.id === shellState.activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                style={{
                  ...tabButtonStyle,
                  color: isActive ? "var(--content-primary)" : "var(--content-muted)",
                  background: isActive ? "var(--surface-subtle)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {Icon ? <Icon size={14} strokeWidth={1.8} /> : null}
                <span style={{ fontSize: "0.75rem" }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Open search"
          onClick={() => onSelectSection("home")}
          style={{ ...iconButtonStyle, color: "var(--content-muted)" }}
        >
          <Search size={20} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
