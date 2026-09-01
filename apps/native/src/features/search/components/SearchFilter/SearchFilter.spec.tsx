import type { TopicDetailDto } from "@sd/core-contracts";

import { render, screen, fireEvent } from "@testing-library/react-native";

import { SearchFilter } from "./SearchFilter";

const topics = [
  { id: "topic-1", slug: "aqeedah", name: { ar: "Aqeedah", en: "Aqeedah" } },
] as TopicDetailDto[];

describe("SearchFilter", () => {
  it("uses native actions while preserving topic-slug selection", async () => {
    const onChange = jest.fn();

    await render(<SearchFilter value={[]} onChange={onChange} topics={topics} />);

    expect(screen.getByTestId("native-search-filter-all")).toBeTruthy();
    expect(screen.getByText("Aqeedah")).toBeTruthy();

    await fireEvent.press(screen.getByTestId("native-search-filter-aqeedah"));
    expect(onChange).toHaveBeenCalledWith(["aqeedah"]);
  });
});
