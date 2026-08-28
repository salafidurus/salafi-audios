/** Documents this module's responsibility and public boundary. */
"use client";

import type { ReactNode } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils";

export interface AdminStatsCardProps {
  /** Icon element (lucide-react icon) */
  icon: ReactNode;
  /** Label for the stat (e.g., "Total Scholars") */
  label: string;
  /** The value to display (usually a number) */
  value: string | number;
  /** Optional trend indicator (e.g., "+12%" or "-5%") */
  trend?: {
    label: string;
    direction: "up" | "down" | "neutral";
  };
  /** Optional onClick handler to make card clickable */
  onClick?: () => void;
  /** Optional href to make card a link */
  href?: string;
  /** Optional className for container */
  className?: string;
}

export function AdminStatsCard({
  icon,
  label,
  value,
  trend,
  onClick,
  href,
  className,
}: AdminStatsCardProps) {
  const { t } = useTranslation();
  const isClickable = onClick || href;
  const content = (
    <Card
      className={cn(
        "gap-4 p-4 transition-colors",
        isClickable && "cursor-pointer hover:bg-muted/50",
        className,
      )}
      data-testid="admin-stats-card"
    >
      <CardHeader className="flex flex-row items-center gap-3 p-0">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-primary">
          {icon}
        </div>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold tracking-tight" data-testid="admin-stat-value">
            {value}
          </p>
          {trend && <TrendBadge trend={trend} />}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block text-inherit no-underline">
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        className="block w-full border-0 bg-transparent p-0 text-start"
        onClick={onClick}
        aria-label={t("admin.stats.viewStat", { defaultValue: `View ${label}`, label })}
      >
        {content}
      </button>
    );
  }

  return content;
}

function TrendBadge({ trend }: { trend: NonNullable<AdminStatsCardProps["trend"]> }) {
  const isDown = trend.direction === "down";
  return (
    <Badge
      variant={isDown ? "outline" : "secondary"}
      className={isDown ? "text-destructive" : undefined}
    >
      {trend.label}
    </Badge>
  );
}
