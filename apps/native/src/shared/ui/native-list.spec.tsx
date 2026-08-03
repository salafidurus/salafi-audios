import { render, screen } from "@testing-library/react-native";
import { View } from "react-native";

import { NativeList } from "./native-list";

jest.mock("@expo/ui", () => {
  const { View } = jest.requireActual<typeof import("react-native")>("react-native");

  return {
    Column: ({ children, testID }: { children?: React.ReactNode; testID?: string }) => (
      <View accessibilityLabel="compose-column" testID={testID}>
        {children}
      </View>
    ),
    List: ({ children, testID }: { children?: React.ReactNode; testID?: string }) => (
      <View accessibilityLabel="react-native-list" testID={testID}>
        {children}
      </View>
    ),
  };
});

describe("NativeList", () => {
  it("uses an Expo UI Column so Android list items remain in the Compose host", async () => {
    await render(
      <NativeList testID="results">
        <View />
      </NativeList>,
    );

    expect(screen.getByTestId("results")).toHaveProp("accessibilityLabel", "compose-column");
  });
});
