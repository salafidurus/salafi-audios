type ActivityProps = {
  label?: string;
};

export function ActivityDesktopWeb({ label = "Loading" }: ActivityProps) {
  return (
    <div
      className="flex items-center justify-center gap-2 text-[var(--content-muted)]"
      style={{
        fontFamily: "var(--typo-caption-font-family)",
        fontSize: "var(--typo-caption-font-size)",
        lineHeight: "var(--typo-caption-line-height)",
      }}
      aria-live="polite"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--content-muted)]" />
      <span>{label}</span>
    </div>
  );
}
