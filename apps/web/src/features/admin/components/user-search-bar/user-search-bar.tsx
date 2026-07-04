"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import styles from "./user-search-bar.module.css";

type UserSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function UserSearchBar({ value, onChange, onSubmit }: UserSearchBarProps): ReactNode {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWrapper}>
        <Search className={styles.icon} />
        <input
          aria-label="Search users"
          placeholder="Search by name or email..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          className={styles.input}
        />
      </div>
      <button type="button" onClick={onSubmit} className={styles.btn}>
        Search
      </button>
    </div>
  );
}
