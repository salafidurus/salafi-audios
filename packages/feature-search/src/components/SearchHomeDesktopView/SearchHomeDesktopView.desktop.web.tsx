"use client";

import { SearchButtonDesktopWeb } from "../SearchButton/SearchButton.desktop.web";
import { TitleTextDesktopWeb } from "../TitleText/TitleText.desktop.web";

type Props = {
  onOpenSearch: () => void;
};

export function SearchHomeDesktopWebView({ onOpenSearch }: Props) {
  return (
    <section className="flex flex-1 items-center justify-center px-[var(--space-layout-page-x)] py-[var(--space-layout-page-y)]">
      <section className="flex w-full max-w-[44rem] flex-col items-center gap-[var(--space-component-gap-lg)] text-center">
        <TitleTextDesktopWeb>Find a lesson</TitleTextDesktopWeb>
        <SearchButtonDesktopWeb
          label="What do you want to listen to?"
          onClick={onOpenSearch}
        />
      </section>
    </section>
  );
}
