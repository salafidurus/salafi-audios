import type { ReactNode } from "react";

import { cn } from "@/shared/utils";

interface HeaderProps {
  children: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <div
      data-slot="sticky-header"
      className={cn(
        "sticky top-0 z-10 flex shrink-0 flex-col gap-2 border-b border-border bg-background/80 py-4 backdrop-blur-md",
        "-mx-10 px-10 max-sm:-mx-4 max-sm:gap-1 max-sm:px-4",
      )}
    >
      {children}
    </div>
  );
}
