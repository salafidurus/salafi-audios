import { render, screen } from "@testing-library/react-native";
import React from "react";

import ScholarsRoute from "./index";

jest.mock("@/features/explore/screens/explore-scholar.screen", () => ({
  ExploreScholarScreen: () => {
    const { Text } = jest.requireActual<typeof import("react-native")>("react-native");
    return <Text>Scholar directory</Text>;
  },
}));

describe("ScholarsRoute", () => {
  it("renders the feature-owned scholar directory", async () => {
    await render(<ScholarsRoute />);

    expect(screen.getByText("Scholar directory")).toBeTruthy();
  });
});
