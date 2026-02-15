import styles from "@/features/navigation/components/search-input/search-input.module.css";

type SearchInputProps = {
  placeholder: string;
  className?: string;
};

export function SearchInput({ placeholder, className }: SearchInputProps) {
  return (
    <label className={`${styles.search} ${className ?? ""}`.trim()} aria-label="Search library">
      <span className={styles["search-icon"]} aria-hidden="true" />
      <input
        type="search"
        placeholder={placeholder}
        className={styles["search-input"]}
        aria-label="Search placeholder"
      />
    </label>
  );
}
