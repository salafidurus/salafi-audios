import { render, screen } from "@testing-library/react-native";
import type { ScholarListItemDto } from "@sd/core-contracts";
import { ExploreScholarScreen } from "./explore-scholar.screen";

const baseScholar: ScholarListItemDto = {
  id: "1",
  slug: "scholar-1",
  name: "Scholar One",
  imageUrl: undefined,
  mainLanguage: "ar",
  lectureCount: 10,
};

jest.mock("@sd/domain-content", () => ({
  useInfiniteScholarsList: jest.fn(() => ({
    data: {
      pages: [
        {
          items: [baseScholar],
        },
      ],
    },
    isFetching: false,
    isError: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  })),
}));

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

jest.mock("@/shared/hooks", () => ({
  useDebouncedSearch: () => ({
    query: "",
    setQuery: jest.fn(),
    debouncedQuery: "",
  }),
}));

describe("ExploreScholarScreen", () => {
  it("should render title", async () => {
    await render(<ExploreScholarScreen />);
    expect(screen.getByText("Scholars")).toBeTruthy();
  });

  it("should render search input", async () => {
    await render(<ExploreScholarScreen />);
    expect(screen.getByPlaceholderText("Search scholars...")).toBeTruthy();
  });

  it("should render scholars", async () => {
    await render(<ExploreScholarScreen />);
    expect(screen.getByText("Scholar One")).toBeTruthy();
  });
});
