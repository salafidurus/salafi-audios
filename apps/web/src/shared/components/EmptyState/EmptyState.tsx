import { BookOpen, CircleAlert, CircleSlash, LoaderCircle } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";

import styles from "./EmptyState.module.css";

export type EmptyStateVariant = "empty" | "loading" | "denied" | "error";

export type EmptyStateProps = {
  message: string;
  variant?: EmptyStateVariant;
};

export function EmptyState({ message, variant = "empty" }: EmptyStateProps) {
  const Icon = getStateIcon(variant);
  const isAlert = isAlertVariant(variant);

  return (
    <Card
      data-variant={variant}
      className={styles.emptyState}
      role={isAlert ? "alert" : "status"}
      aria-live={isAlert ? "assertive" : "polite"}
    >
      <CardContent className={styles.content}>
        <Icon className={styles.icon} aria-hidden="true" />
        <p className={styles.message}>{message}</p>
      </CardContent>
    </Card>
  );
}

function getStateIcon(variant: EmptyStateVariant) {
  switch (variant) {
    case "error":
      return CircleAlert;
    case "denied":
      return CircleSlash;
    case "loading":
      return LoaderCircle;
    default:
      return BookOpen;
  }
}

function isAlertVariant(variant: EmptyStateVariant): boolean {
  return variant === "error" || variant === "denied";
}
