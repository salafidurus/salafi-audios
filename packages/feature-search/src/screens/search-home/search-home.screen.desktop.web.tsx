"use client";

import { useRouter } from "next/navigation";
import { QuickBrowseDesktopWeb } from "../../components/QuickBrowse/QuickBrowse.desktop.web";
import { SearchButtonDesktopWeb } from "../../components/SearchButton/SearchButton.desktop.web";
import { TitleTextDesktopWeb } from "../../components/TitleText/TitleText.desktop.web";

export function SearchHomeDesktopWebScreen() {
  const router = useRouter();

  return (
    <section className="flex flex-1 items-center justify-center px-[var(--space-layout-page-x)] py-[var(--space-layout-page-y)]">
      <section className="flex w-full max-w-[56rem] flex-col items-center gap-[var(--space-scale-4xl)] text-center">
        <div className="flex w-full max-w-[44rem] flex-col items-center gap-[var(--space-component-gap-lg)]">
          <TitleTextDesktopWeb>Find a lesson</TitleTextDesktopWeb>
          <SearchButtonDesktopWeb
            label="What do you want to listen to?"
            onClick={() => router.push("/search")}
          />
        </div>
        <QuickBrowseDesktopWeb
          onSelectCategory={(searchKey) =>
            router.push(`/search?searchKey=${encodeURIComponent(searchKey)}`)
          }
        />
      </section>
    </section>
  );
}
