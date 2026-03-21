"use client";

export { Footer } from "./components/footer/footer";
export { Sidebar } from "./components/sidebar/sidebar";
export { TopAuthStrip } from "./components/top-auth-strip/top-auth-strip";
export { SECTION_TABS, SECTION_ROUTES, SECTION_LABELS } from "./types.native";
export type { Section, TabConfig } from "./types.native";
export { getCurrentSection, getActiveTabFromPath } from "./utils/get-current-section";
export { useNavigationStore } from "./store/navigation-store";
