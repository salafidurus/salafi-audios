import type { ReactNode } from "react";
import type { BreadCrumb } from "@/features/library/types/library.types";
import { Breadcrumbs } from "@/features/navigation/components/breadcrumbs/breadcrumbs";
import { PageHeader } from "@/features/library/components/layout/page-header/page-header";
import styles from "./shell.module.css";

type ShellProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadCrumb[];
  children: ReactNode;
  hideHeader?: boolean;
};

export function Shell({ title, subtitle, breadcrumbs, children, hideHeader = false }: ShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {breadcrumbs && !hideHeader && <Breadcrumbs items={breadcrumbs} />}
        {!hideHeader && <PageHeader title={title} subtitle={subtitle} />}
        {children}
      </div>
    </main>
  );
}
