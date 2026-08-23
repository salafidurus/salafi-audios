import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "bun:test";
import React from "react";

import { InfiniteScrollList } from "./InfiniteScrollList";

describe("InfiniteScrollList", () => {
  it("keeps a pagination sentinel when a filtered page is empty but more data exists", () => {
    render(
      <InfiniteScrollList
        data={[]}
        renderItem={() => null}
        hasMore
        isFetchingNextPage
        onLoadMore={() => {}}
        emptyMessage="No matching users"
      />,
    );

    expect(screen.getByText("No matching users")).toBeInTheDocument();
    expect(screen.getByText("Loading more…")).toBeInTheDocument();
    expect(screen.getByTestId("infinite-scroll-sentinel")).toBeInTheDocument();
  });
});
