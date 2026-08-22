import { BookOpen, CircleAlert, CircleSlash, LoaderCircle } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";

import styles from "./EmptyState.module.css";

export type EmptyStateVariant = "empty" | "loading" | "denied" | "error";

export type EmptyStateProps = {
  message: string;
  variant?: EmptyStateVariant;
};

export function EmptyState({ message, variant = "empty" }: EmptyStateProps) {
  const Icon =
    variant === "error"
      ? CircleAlert
      : variant === "denied"
        ? CircleSlash
        : variant === "loading"
          ? LoaderCircle
          : BookOpen;

  return (
    <Card
      data-variant={variant}
      className={styles.emptyState}
      role={variant === "error" || variant === "denied" ? "alert" : "status"}
      aria-live={variant === "error" || variant === "denied" ? "assertive" : "polite"}
    >
      <CardContent className={styles.content}>
        <Icon className={styles.icon} aria-hidden="true" />
        <p className={styles.message}>{message}</p>
      </CardContent>
    </Card>
  );
}
