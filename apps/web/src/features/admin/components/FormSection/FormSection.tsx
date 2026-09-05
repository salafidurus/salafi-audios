import styles from "./form-section.module.css";

/**
 * Defines the stable content boundary for a visually grouped administration-form subsection.
 * The title is rendered as the subsection heading, while `children` remains responsible for
 * the field controls and their validation behavior.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the interface contract is documented in the block above.
export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

/** Renders a titled form subsection while keeping its fields in the shared admin layout. */
export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionContent}>{children}</div>
    </div>
  );
}
