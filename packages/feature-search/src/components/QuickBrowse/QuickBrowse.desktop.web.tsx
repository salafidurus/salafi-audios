"use client";

import { BrowseCardDesktopWeb } from "../BrowseCard/BrowseCard.desktop.web";

const browseCategories = [
  { name: "Senior Scholars", searchKey: "Senior Scholars" },
  { name: "Hadith", searchKey: "Hadith" },
  { name: "Fiqh", searchKey: "Fiqh" },
  { name: "Tafsir", searchKey: "Tafsir" },
  { name: "Arabic", searchKey: "Arabic" },
  { name: "Farah", searchKey: "Farah" },
] as const;

export type QuickBrowseDesktopWebProps = {
  onSelectCategory?: (searchKey: string) => void;
};

const headerStyle = {
  fontFamily: "var(--typo-title-md-font-family)",
  fontSize: "var(--typo-title-md-font-size)",
  lineHeight: "var(--typo-title-md-line-height)",
  letterSpacing: "var(--typo-title-md-letter-spacing)",
  fontWeight: "var(--typo-title-md-font-weight)",
} as const;

export function QuickBrowseDesktopWeb({ onSelectCategory }: QuickBrowseDesktopWebProps) {
  return (
    <section className="flex w-full max-w-[56rem] flex-col gap-[var(--space-component-gap-md)]">
      <h2 className="m-0 text-[var(--content-strong)]" style={headerStyle}>
        Browse all
      </h2>
      <div className="grid grid-cols-2 gap-[var(--space-component-gap-md)] lg:grid-cols-3">
        {browseCategories.map((category) => (
          <BrowseCardDesktopWeb
            key={category.name}
            name={category.name}
            onPress={() => onSelectCategory?.(category.searchKey)}
          />
        ))}
      </div>
    </section>
  );
}
