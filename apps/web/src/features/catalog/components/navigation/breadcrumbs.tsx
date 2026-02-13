import Link from "next/link";
import type { BreadCrumb } from "@/features/catalog/types/catalog.types";

type BreadcrumbsProps = {
  items?: BreadCrumb[];
};

export function Breadcrumbs({ items = [] }: BreadcrumbsProps) {
  return (
    <nav className="catalog-breadcrumbs" aria-label="Breadcrumb">
      <Link href="/scholars" className="catalog-link-inline">
        Scholars
      </Link>
      {items.map((item) => (
        <span key={item.href} className="catalog-breadcrumb-item">
          <span aria-hidden="true" className="catalog-breadcrumb-separator">
            /
          </span>
          <Link href={item.href} className="catalog-link-inline">
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
