import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { ListContainer } from "./native-list-container";

describe("ListContainer", () => {
  it("hosts rows in the supported Expo UI List surface", async () => {
    await render(
      <ListContainer>
        <Text>Row</Text>
      </ListContainer>,
    );

    expect(screen.getByTestId("native-list")).toBeTruthy();
    expect(screen.getByText("Row")).toBeTruthy();
  });
});
