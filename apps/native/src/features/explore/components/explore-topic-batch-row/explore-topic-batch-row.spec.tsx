import type { ExploreTopicItemDto } from "@sd/core-contracts";

import { render, screen } from "@testing-library/react-native";
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

  it("does not expose topic steering callbacks", async () => {
    await render(<ExploreTopicBatchRow title="Explore topics" topics={topics} />);

    expect(screen.getByTestId("native-topic-card-aqeedah")).toBeTruthy();
  });
});
