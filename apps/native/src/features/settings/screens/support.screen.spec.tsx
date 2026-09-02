import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { SupportScreen } from "./support.screen";

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
jest.mock("@/features/navigation", () => ({
  RootScreenHeader: ({ title }: { title: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return <Text>{title}</Text>;
  },
}));
jest.mock("@/shared/ui", () => {
  const { Text, View } = require("react-native");
  return {
    NativeBridgeHost: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    NativeText: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
  };
});

describe("SupportScreen", () => {
  it("renders the web-aligned form, FAQ, and contact sections", async () => {
    await render(<SupportScreen />);

    expect(screen.getByTestId("support-form-card")).toBeTruthy();
    expect(screen.getByTestId("support-faq-card")).toBeTruthy();
    expect(screen.getByTestId("support-contact-card")).toBeTruthy();
    expect(screen.getByText("support.form.name")).toBeTruthy();
    expect(screen.getByText("support.form.submit")).toBeTruthy();
  });

  it("expands one FAQ answer and routes legal links", async () => {
    const onNavigateToTerms = jest.fn();
    const onNavigateToPrivacy = jest.fn();
    await render(
      <SupportScreen
        onNavigateToTerms={onNavigateToTerms}
        onNavigateToPrivacy={onNavigateToPrivacy}
      />,
    );

    expect(screen.queryByText("support.faq.whatIs.a")).toBeNull();
    await fireEvent.press(screen.getByText("support.faq.whatIs.q"));
    expect(screen.getByText("support.faq.whatIs.a")).toBeTruthy();
    await fireEvent.press(screen.getByText("common.privacyPolicy"));
    await fireEvent.press(screen.getByText("common.termsOfService"));
    expect(onNavigateToPrivacy).toHaveBeenCalledTimes(1);
    expect(onNavigateToTerms).toHaveBeenCalledTimes(1);
  });
});
