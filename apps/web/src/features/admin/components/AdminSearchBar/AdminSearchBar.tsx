import { Search } from "lucide-react";
import { Button } from "@/shared/components/Button";
import styles from "./admin-search-bar.module.css";

export interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  loading?: boolean;
}

export function AdminSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  loading = false,
}: AdminSearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <Search size={18} className={styles.icon} />
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={onSearch}
        loading={loading}
        className={styles.button}
      >
        Search
      </Button>
    </div>
  );
}
