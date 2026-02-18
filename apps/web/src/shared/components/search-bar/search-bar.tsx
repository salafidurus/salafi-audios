import styles from "./search-bar.module.css";

type SearchBarProps = {
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchBar({ placeholder, className, value, onChange }: SearchBarProps) {
  return (
    <label className={`${styles.search} ${className ?? ""}`.trim()} aria-label="Search">
      <span className={styles.searchIcon} aria-hidden="true" />
      <input
        type="search"
        placeholder={placeholder}
        className={styles.searchInput}
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}
