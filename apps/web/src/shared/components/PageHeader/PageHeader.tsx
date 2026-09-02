import type { ReactNode } from "react";

import { cn } from "@/shared/utils";

/** Documents this module's responsibility and public boundary. */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className="mb-8 flex flex-wrap items-start justify-between gap-4"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl leading-tight font-bold text-foreground max-sm:text-2xl">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && (
        <div className={cn("flex flex-wrap gap-2", "max-sm:items-center")}>{actions}</div>
      )}
    </header>
  );
}
