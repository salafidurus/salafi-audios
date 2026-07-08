"use client";

import { SegmentedControl } from "@/shared/components/SegmentedControl";
import styles from "./admin-contents-tabs.module.css";

export type AdminContentsTab = "topics" | "listings";

export interface AdminContentsTabsProps {
  activeTab: AdminContentsTab;
  onTabChange: (tab: AdminContentsTab) => void;
}

const tabs = [
  { value: "topics", label: "Topics" },
  { value: "listings", label: "Listings" },
];

export function AdminContentsTabs({ activeTab, onTabChange }: AdminContentsTabsProps) {
  return (
    <div className={styles.container}>
      <SegmentedControl
        options={tabs}
        value={activeTab}
        onChange={(value: string) => onTabChange(value as AdminContentsTab)}
      />
    </div>
  );
}
