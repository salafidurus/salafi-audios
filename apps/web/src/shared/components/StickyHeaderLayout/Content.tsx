import type { ReactNode } from "react";

/** Content accepted by the flexible main region below the sticky header. */
interface ContentProps {
  children: ReactNode;
}

/** Renders the flexible content region paired with `StickyHeaderLayout.Header`. */
export function Content({ children }: ContentProps) {
  return (
    <section data-slot="sticky-content" className="flex min-h-0 flex-1 flex-col pb-8 pt-5">
      {children}
    </section>
  );
}
