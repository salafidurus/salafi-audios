import type { ReactNode } from "react";

export function DetailList({ children }: { children: ReactNode }) {
  return <dl className="catalog-detail-list">{children}</dl>;
}

export function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="catalog-detail-row">
      <dt className="catalog-detail-label">{label}</dt>
      <dd className="catalog-detail-value">{value ?? "-"}</dd>
    </div>
  );
}
