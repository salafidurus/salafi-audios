import type { ExploreScholarItemDto } from "@sd/core-contracts";

import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { ExploreScholarRow } from "./explore-scholar-row";

const scholars: ExploreScholarItemDto[] = [
  {
    id: "scholar-1",
    slug: "scholar-one",
    name: "Scholar One",
    imageUrl: undefined,
    mainLanguage: "ar",
    title: "allamah",
    lectureCount: 12,
  },
  {
    id: "scholar-2",
    slug: "scholar-two",
    name: "Scholar Two",
    imageUrl: undefined,
    mainLanguage: "ar",
    title: "allamah",
    lectureCount: 3,
  },
];

describe("ExploreScholarRow", () => {
  it("renders the supplied title and preserves scholar order", async () => {
    await render(<ExploreScholarRow scholars={scholars} title="Senior Scholars" />);

    expect(screen.getByText("Senior Scholars")).toBeTruthy();
    expect(screen.getAllByText(/Scholar /).map((item) => item.props.children)).toEqual([
      "Scholar One",
      "Scholar Two",
    ]);
  });

  it("navigates using the supplied public scholar slug", async () => {
    const onScholarPress = jest.fn();
    await render(<ExploreScholarRow scholars={scholars} onScholarPress={onScholarPress} />);

    await fireEvent.press(screen.getByTestId("scholar-card-scholar-one"));

    expect(onScholarPress).toHaveBeenCalledWith("scholar-one");
  });
});
