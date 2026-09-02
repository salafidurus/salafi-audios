/** Documents this module's responsibility and public boundary. */
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

interface ExternalLinkProps {
  href: string;
  title: string;
}

export function ExternalLink({ href, title }: ExternalLinkProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href={href} target="_blank" rel="noopener noreferrer" title={href}>
            {title}
          </a>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {href}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
