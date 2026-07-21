import type { ReactNode } from "react";
import { Header } from "./Header";
import { Content } from "./Content";

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
