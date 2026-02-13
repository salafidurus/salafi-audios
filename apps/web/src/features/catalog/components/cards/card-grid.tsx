import type { ReactNode } from "react";

export function CardGrid({ children }: { children: ReactNode }) {
  return <ul className="catalog-card-grid">{children}</ul>;
}
