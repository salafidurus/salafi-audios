import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "bun:test";

import { AdaptiveDataView } from "./AdaptiveDataView";

describe("AdaptiveDataView", () => {
  type TestRow = { id: string; name: string; status: string; actions: string };
  const emptyData: TestRow[] = [];
  const columns = [
    { key: "name", header: "Name", priority: "primary" as const, sortable: true },
    { key: "status", header: "Status", priority: "secondary" as const },
    { key: "actions", header: "Actions", priority: "primary" as const },
  ];

  it("exposes sortable primary data and retains secondary data for adaptive layouts", () => {
    const onSort = vi.fn();

    render(
      <AdaptiveDataView
        ariaLabel="Accessible content"
        columns={columns}
        data={[{ id: "1", name: "Lesson one", status: "Published", actions: "Edit" }]}
        getRowKey={(row) => row.id}
        onSort={onSort}
        sort={{ key: "name", direction: "ascending" }}
      />,
    );

    expect(screen.getByRole("table", { name: "Accessible content" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sort by name/i })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders accessible loading, empty, and error feedback", () => {
    const { rerender } = render(
      <AdaptiveDataView
        ariaLabel="Accessible content"
        columns={columns}
        data={emptyData}
        getRowKey={(row) => row.id}
        state="loading"
        loadingMessage="Loading content"
      />,
    );

    expect(screen.getByRole("status", { name: "Loading content" })).toBeInTheDocument();

    rerender(
      <AdaptiveDataView
        ariaLabel="Accessible content"
        columns={columns}
        data={emptyData}
        getRowKey={(row) => row.id}
        emptyMessage="No content available"
      />,
    );
    expect(screen.getByRole("status", { name: "No content available" })).toBeInTheDocument();

    rerender(
      <AdaptiveDataView
        ariaLabel="Accessible content"
        columns={columns}
        data={emptyData}
        getRowKey={(row) => row.id}
        state="error"
        errorMessage="Unable to load content"
      />,
    );
    expect(screen.getByRole("alert", { name: "Unable to load content" })).toBeInTheDocument();
  });
});
