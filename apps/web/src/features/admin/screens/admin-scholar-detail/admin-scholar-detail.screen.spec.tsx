import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminScholarDetailScreen } from "./admin-scholar-detail.screen";

vi.mock("@sd/core-contracts", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useApiQuery: vi.fn((key) => {
      if (key[0] === "scholars" && key[1] === "list") {
        return {
          data: {
            scholars: [{ id: "scholar-1", name: "Scholar One", slug: "scholar-one" }],
          },
          isFetching: false,
        };
      }
      if (key[0] === "admin-listings-scholar") {
        return {
          data: [
            {
              id: "ser-1",
              title: "Series One",
              scholarId: "scholar-1",
              scholarName: "Scholar One",
              format: "series",
              orderIndex: 1,
              status: "published",
              createdAt: "2026-07-04T00:00:00Z",
            },
            {
              id: "ser-2",
              title: "Series Two",
              scholarId: "scholar-1",
              scholarName: "Scholar One",
              format: "series",
              orderIndex: 2,
              status: "draft",
              createdAt: "2026-07-04T00:00:00Z",
            },
            {
              id: "col-1",
              title: "Collection One",
              scholarId: "scholar-1",
              scholarName: "Scholar One",
              format: "collection",
              orderIndex: 1,
              status: "published",
              createdAt: "2026-07-04T00:00:00Z",
            },
          ],
          isFetching: false,
        };
      }
      return { data: undefined, isFetching: false };
    }),
    httpClient: vi.fn(() => Promise.resolve({ success: true })),
    queryKeys: {
      scholars: {
        list: () => ["scholars", "list"],
      },
      admin: {
        listings: {
          list: "/admin/listings",
        },
      },
    },
  };
});

describe("AdminScholarDetailScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders scholar details, series, and collections lists", async () => {
    render(<AdminScholarDetailScreen id="scholar-1" />);

    expect(screen.getByText(/manage scholar/i)).toBeInTheDocument();
    expect(screen.getByText("Scholar One")).toBeInTheDocument();

    // Verify Series section lists items
    expect(screen.getByText("Series One")).toBeInTheDocument();
    expect(screen.getByText("Series Two")).toBeInTheDocument();

    // Verify Collections section lists items
    expect(screen.getByText("Collection One")).toBeInTheDocument();
  });
});
