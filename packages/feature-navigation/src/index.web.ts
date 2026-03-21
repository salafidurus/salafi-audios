"use client";

export { SECTION_TABS, SECTION_ROUTES, SECTION_LABELS, DEFAULT_TABS } from "./types";
export type { Section, TabConfig } from "./types";
export { Footer } from "./components/footer/footer";
export { Sidebar } from "./components/sidebar/sidebar";
export { TopAuthStrip } from "./components/top-auth-strip/top-auth-strip";
export { getCurrentSection, getActiveTabFromPath } from "./utils/get-current-section.web";
export { useNavigationStore } from "./store/navigation-store.web";
