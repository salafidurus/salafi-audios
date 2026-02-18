import styles from "@/features/navigation/components/search-input/search-input.module.css";

type SearchInputProps = {
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchInput({ placeholder, className, value, onChange }: SearchInputProps) {
  return (
    <label className={`${styles.search} ${className ?? ""}`.trim()} aria-label="Search library">
      <span className={styles["search-icon"]} aria-hidden="true" />
      <input
        type="search"
        placeholder={placeholder}
        className={styles["search-input"]}
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}
