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
};

export function Shell({ title, subtitle, breadcrumbs, children }: ShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Breadcrumbs items={breadcrumbs} />
        <PageHeader title={title} subtitle={subtitle} />
        {children}
      </div>
    </main>
  );
}
