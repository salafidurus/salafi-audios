import type { ListingContentsDto } from "@sd/core-contracts";
import type { QueueListingRef } from "@sd/domain-audio";

import { render, screen } from "@testing-library/react-native";

import { ListingContentView } from "./listing-content-view";

jest.mock("@sd/domain-audio", () => ({
  buildTrackQueue: jest.fn(() => []),
}));

jest.mock("../lesson-row/lesson-row", () => {
  const { Text } = require("react-native");
  return {
    LessonRow: ({
      item,
      highlighted,
    }: {
      item: { id: string; title: string };
      highlighted?: boolean;
    }) => (
      <Text testID={`lesson-row-${item.id}`}>
        {item.title} {highlighted ? "(highlighted)" : ""}
      </Text>
    ),
  };
});

const listingRef: QueueListingRef = {
  id: "series-1",
  title: "Series One",
  format: "series",
  scholarName: "Ibn Baz",
};

const seriesContents: ListingContentsDto = {
  format: "series",
  items: [
    { id: "lesson-1", slug: "lesson-1", title: "Lesson One", primaryAudioAsset: null },
    { id: "lesson-2", slug: "lesson-2", title: "Lesson Two", primaryAudioAsset: null },
  ],
};

const collectionContents: ListingContentsDto = {
  format: "collection",
  modules: [
    {
      id: "module-1",
      slug: "module-1",
      title: "Module One",
      lessons: [{ id: "lesson-1", slug: "lesson-1", title: "Lesson One", primaryAudioAsset: null }],
    },
  ],
};

describe("ListingContentView", () => {
  it("renders a flat lesson list for a series", async () => {
    await render(<ListingContentView contents={seriesContents} listingRef={listingRef} />);
    expect(screen.getByTestId("lesson-row-lesson-1")).toBeTruthy();
    expect(screen.getByTestId("lesson-row-lesson-2")).toBeTruthy();
  });

  it("renders module headers and their lessons for a collection", async () => {
    await render(<ListingContentView contents={collectionContents} listingRef={listingRef} />);
    expect(screen.getByText("Module One")).toBeTruthy();
    expect(screen.getByTestId("lesson-row-lesson-1")).toBeTruthy();
  });

  it("marks the matching lesson as highlighted", async () => {
    await render(
      <ListingContentView
        contents={seriesContents}
        listingRef={listingRef}
        highlightItemId="lesson-2"
      />,
    );
    expect(screen.getByTestId("lesson-row-lesson-1").props.children.join("")).not.toMatch(
      /highlighted/,
    );
    expect(screen.getByTestId("lesson-row-lesson-2").props.children.join("")).toMatch(
      /highlighted/,
    );
  });
});
