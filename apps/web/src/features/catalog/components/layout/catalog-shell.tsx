import type { ReactNode } from "react";
import type { BreadCrumb } from "@/features/catalog/types/catalog.types";
import { Breadcrumbs } from "@/features/catalog/components/navigation/breadcrumbs";
import { PageHeader } from "@/features/catalog/components/layout/page-header";

type CatalogShellProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadCrumb[];
  children: ReactNode;
};

export function CatalogShell({ title, subtitle, breadcrumbs, children }: CatalogShellProps) {
  return (
    <main className="catalog-page-shell">
      <div className="catalog-container">
        <Breadcrumbs items={breadcrumbs} />
        <PageHeader title={title} subtitle={subtitle} />
        {children}
      </div>
    </main>
  );
}
