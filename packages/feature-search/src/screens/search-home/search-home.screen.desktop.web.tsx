"use client";

import { QuickBrowseDesktopWeb } from "../../components/QuickBrowse/QuickBrowse.desktop.web";
import { SearchButtonDesktopWeb } from "../../components/SearchButton/SearchButton.desktop.web";
import { TitleTextDesktopWeb } from "../../components/TitleText/TitleText.desktop.web";

export type SearchHomeDesktopWebScreenProps = {
  onOpenSearch?: () => void;
  onSelectCategory?: (searchKey: string) => void;
};

export function SearchHomeDesktopWebScreen({
  onOpenSearch,
  onSelectCategory,
}: SearchHomeDesktopWebScreenProps) {
  return (
    <section className="flex flex-1 items-center justify-center px-[var(--space-layout-page-x)] py-[var(--space-layout-page-y)]">
      <section className="flex w-full max-w-[56rem] flex-col items-center gap-[var(--space-scale-4xl)] text-center">
        <div className="flex w-full max-w-[44rem] flex-col items-center gap-[var(--space-component-gap-lg)]">
          <TitleTextDesktopWeb>Find a lesson</TitleTextDesktopWeb>
          <SearchButtonDesktopWeb label="What do you want to listen to?" onClick={onOpenSearch} />
        </div>
        <QuickBrowseDesktopWeb onSelectCategory={onSelectCategory} />
      </section>
    </section>
  );
}
