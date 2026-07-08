import styles from "./EmptyState.module.css";

export type EmptyStateVariant = "empty" | "loading" | "error";

export type EmptyStateProps = {
  message: string;
  variant?: EmptyStateVariant;
};

export function EmptyState({ message, variant = "empty" }: EmptyStateProps) {
  return (
    <div data-variant={variant} className={styles.emptyState}>
      {message}
    </div>
  );
}
