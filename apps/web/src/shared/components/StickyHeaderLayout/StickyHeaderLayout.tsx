import type { ReactNode } from "react";

import { Content } from "./Content";
import { Header } from "./Header";

/** Documents this module's responsibility and public boundary. */
interface StickyHeaderLayoutProps {
  children: ReactNode;
}

function StickyHeaderLayoutRoot({ children }: StickyHeaderLayoutProps) {
  return <>{children}</>;
}

export const StickyHeaderLayout = Object.assign(StickyHeaderLayoutRoot, {
  Header,
  Content,
});
