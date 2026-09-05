import type { ExploreTopicItemDto } from "@sd/core-contracts";

import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { ExploreTopicBatchRow } from "./explore-topic-batch-row";

const topics: ExploreTopicItemDto[] = [
  { id: "topic-1", slug: "aqeedah", name: "Aqeedah" },
  { id: "topic-2", slug: "fiqh", name: "Fiqh" },
];

describe("ExploreTopicBatchRow", () => {
  it("renders the supplied title and preserves topic order", async () => {
    await render(<ExploreTopicBatchRow title="Explore topics" topics={topics} />);

    expect(screen.getByText("Explore topics")).toBeTruthy();
    expect(screen.getByText("Aqeedah")).toBeTruthy();
    expect(screen.getByText("Fiqh")).toBeTruthy();
  });

  it("uses the public topic slug when a topic is pressed", async () => {
    const onTopicPress = jest.fn();
    await render(
      <ExploreTopicBatchRow title="Explore topics" topics={topics} onTopicPress={onTopicPress} />,
    );

    await fireEvent.press(screen.getByTestId("native-topic-card-aqeedah"));

    expect(onTopicPress).toHaveBeenCalledWith("aqeedah");
  });
});
