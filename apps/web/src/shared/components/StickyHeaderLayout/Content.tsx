import type { ReactNode } from "react";

/** Documents this module's responsibility and public boundary. */
interface ContentProps {
  children: ReactNode;
}

export function Content({ children }: ContentProps) {
  return (
    <section data-slot="sticky-content" className="flex min-h-0 flex-1 flex-col pb-8 pt-5">
      {children}
    </section>
  );
}
