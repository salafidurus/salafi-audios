import type { ReactNode } from "react";

type SectionBlockProps = {
  title: string;
  children: ReactNode;
};

export function SectionBlock({ title, children }: SectionBlockProps) {
  return (
    <section className="catalog-section-block">
      <div className="catalog-section-heading">
        <h2 className="catalog-section-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}
