import styles from "./page-header.module.css";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className={styles["catalog-header-panel"]}>
      <p className={styles["catalog-header-kicker"]}>Read-only catalog</p>
      <h1 className={styles["catalog-title"]}>{title}</h1>
      {subtitle ? <p className={styles["catalog-subtitle"]}>{subtitle}</p> : null}
    </header>
  );
}
