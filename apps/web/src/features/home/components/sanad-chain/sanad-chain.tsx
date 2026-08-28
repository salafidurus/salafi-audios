import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Card, CardContent } from "@/shared/components/ui/card";

import styles from "./sanad-chain.module.css";

/** Describes the lesson-count inputs used to render the sanad progress chain. */
type SanadChainProps = {
  total?: number;
  completed?: number;
  size?: number;
};

/** Renders a capped lesson-progress chain with an accessible textual summary. */
export function SanadChain({ total = 6, completed = 3, size = 8 }: SanadChainProps) {
  const safeTotal = Math.max(0, total);
  const capped = Math.min(safeTotal, 8);
  const done =
    safeTotal === 0
      ? 0
      : Math.min(capped, Math.max(0, Math.round((completed / safeTotal) * capped)));
  const summary = `${Math.min(safeTotal, Math.max(0, completed))} of ${safeTotal} lessons completed`;

  return (
    <Accordion type="single" collapsible className={styles.accordion}>
      <AccordionItem value="progress" className={styles.item}>
        <AccordionTrigger className={styles.trigger} aria-label={summary}>
          <span className={styles.root} style={{ width: capped * (size + 10) }} aria-hidden="true">
            {Array.from({ length: capped }).map((_, i) => (
              <span key={i} className={styles.itemWrap}>
                <span
                  className={styles.dot}
                  style={{
                    width: size,
                    height: size,
                    background: i < done ? "var(--action-primary)" : "transparent",
                    border: `1.5px solid ${i < done ? "var(--action-primary)" : "var(--content-muted)"}`,
                  }}
                />
                {i < capped - 1 && (
                  <span
                    className={styles.line}
                    style={{
                      width: 10,
                      background: i < done - 1 ? "var(--action-primary)" : "var(--border-subtle)",
                    }}
                  />
                )}
              </span>
            ))}
          </span>
          <span className="sr-only">{summary}</span>
        </AccordionTrigger>
        <AccordionContent>
          <Card size="sm" className={styles.summaryCard}>
            <CardContent className={styles.summaryContent}>{summary}</CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
