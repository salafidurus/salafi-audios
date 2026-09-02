import { render, screen, fireEvent } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthRequiredState } from "./AuthRequiredState";

describe("AuthRequiredState", () => {
  it("renders native text styles and invokes the sign-in action", async () => {
    const onPress = jest.fn();
    await render(
      <SafeAreaProvider
        initialMetrics={{
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
          frame: { x: 0, y: 0, width: 320, height: 640 },
        }}
      >
        <AuthRequiredState
          title="Sign in required"
          description="Save lectures to your library."
          onPress={onPress}
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText("Sign in required").props.textStyle).toEqual(
      expect.objectContaining({ fontSize: 20, textAlign: "center" }),
    );
    await fireEvent.press(screen.getByText("Sign In"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
