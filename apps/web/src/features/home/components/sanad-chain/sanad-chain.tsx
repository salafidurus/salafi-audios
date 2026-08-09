import styles from "./sanad-chain.module.css";

type SanadChainProps = {
  total?: number;
  completed?: number;
  size?: number;
};

export function SanadChain({ total = 6, completed = 3, size = 8 }: SanadChainProps) {
  const capped = Math.min(total, 8);
  const done = Math.round((completed / total) * capped);

  return (
    <div className={styles.root} style={{ width: capped * (size + 10) }}>
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
    </div>
  );
}
