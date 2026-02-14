import styles from "@/features/catalog/components/navigation/catalog-search-input.module.css";

type CatalogSearchInputProps = {
  placeholder: string;
  className?: string;
};

export function CatalogSearchInput({ placeholder, className }: CatalogSearchInputProps) {
  return (
    <label className={`${styles.search} ${className ?? ""}`.trim()} aria-label="Search catalog">
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
