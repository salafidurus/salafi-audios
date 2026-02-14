import Link from "next/link";
import type { BreadCrumb } from "@/features/catalog/types/catalog.types";
import styles from "./breadcrumbs.module.css";

type BreadcrumbsProps = {
  items?: BreadCrumb[];
};

export function Breadcrumbs({ items = [] }: BreadcrumbsProps) {
  return (
    <nav className={styles["catalog-breadcrumbs"]} aria-label="Breadcrumb">
      <Link href="/" className={styles["catalog-link-inline"]}>
        Scholars
      </Link>
      {items.map((item) => (
        <span key={item.href} className={styles["catalog-breadcrumb-item"]}>
          <span aria-hidden="true" className={styles["catalog-breadcrumb-separator"]}>
            /
          </span>
          <Link href={item.href} className={styles["catalog-link-inline"]}>
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
