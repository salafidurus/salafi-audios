import type { ReactNode } from "react";

import { Content } from "./Content";
import { Header } from "./Header";

/** Children composed from the sticky header and content subcomponents. */
interface StickyHeaderLayoutProps {
  children: ReactNode;
}

/** Groups the sticky header and scrollable content regions without extra DOM. */
function StickyHeaderLayoutRoot({ children }: StickyHeaderLayoutProps) {
  return <>{children}</>;
}

/** Compound layout API exposing `Header` and `Content` regions. */
export const StickyHeaderLayout = Object.assign(StickyHeaderLayoutRoot, {
  Header,
  Content,
});
