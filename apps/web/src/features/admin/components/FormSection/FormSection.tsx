import styles from "./form-section.module.css";

/** Defines the heading and content rendered inside one visually grouped form section. */
export interface FormSectionProps {
  /** Section heading shown above the grouped controls. */
  title: string;
  /** Form controls or explanatory content displayed below the heading. */
  children: React.ReactNode;
}

/** Renders a titled container that groups related form controls. */
export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionContent}>{children}</div>
    </div>
  );
}
