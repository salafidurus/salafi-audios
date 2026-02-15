import Link from "next/link";
import type { BreadCrumb } from "@/features/library/types/library.types";
import styles from "./breadcrumbs.module.css";

type BreadcrumbsProps = {
  items?: BreadCrumb[];
};

export function Breadcrumbs({ items = [] }: BreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <Link href="/" className={styles.link}>
        Scholars
      </Link>
      {items.map((item) => (
        <span key={item.href} className={styles.breadcrumbItem}>
          <span aria-hidden="true" className={styles.breadcrumbSeparator}>
            /
          </span>
          <Link href={item.href} className={styles.link}>
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
