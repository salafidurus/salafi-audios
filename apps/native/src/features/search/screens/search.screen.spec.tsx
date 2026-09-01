import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { SearchScreen } from "./search.screen";

jest.mock("@sd/domain-search", () => ({
  useSearchProcessing: jest.fn(),
}));

const { useSearchProcessing: mockUseSearchProcessing } = jest.requireMock("@sd/domain-search") as {
  useSearchProcessing: jest.Mock;
};

jest.mock("@/core/i18n/use-translation", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

jest.mock("../components/SearchFilter/SearchFilter", () => ({
  SearchFilter: () => null,
}));

jest.mock("../components/SearchResultItem/SearchResultItem", () => ({
  SearchResultItem: ({ title, onPress }: { title: string; onPress?: () => void }) => {
    const { Pressable, Text } = jest.requireActual<typeof import("react-native")>("react-native");
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    );
  },
}));

jest.mock("../components/SearchResultsList/SearchResultsList", () => ({
  SearchResultsList: ({
    items,
    renderItem,
  }: {
    items: Array<{ id: string }>;
    renderItem: (item: { id: string; title: string; slug: string }) => React.ReactElement;
  }) => {
    const ReactMock = jest.requireActual<typeof import("react")>("react");
    return (
      <>
        {items.map((item) => (
          <ReactMock.Fragment key={item.id}>{renderItem(item as never)}</ReactMock.Fragment>
        ))}
      </>
    );
  },
}));

jest.mock("@/shared/ui", () => {
  const { Pressable, Text, TextInput } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    AppText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    NativeButton: ({ label, onPress }: { label: string; onPress?: () => void }) => (
      <Pressable onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    ),
    NativeFormField: ({ value, onChangeText, placeholder, testID }: any) => (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        testID={testID}
      />
    ),
    ScreenView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe("SearchScreen", () => {
  it("navigates to a selected listing through the supplied callback", async () => {
    const onNavigateToListing = jest.fn();
    mockUseSearchProcessing.mockReturnValue({
      query: "",
      setQuery: jest.fn(),
      filter: [],
      setFilter: jest.fn(),
      topics: [],
      items: [
        {
          id: "listing-1",
          slug: "listing-one",
          title: "Listing One",
          format: "single",
          scholarName: "Scholar One",
          lectureCount: 1,
        },
      ],
      isFetching: false,
      shouldSearch: true,
      errorMessage: undefined,
    });

    await render(<SearchScreen onNavigateToListing={onNavigateToListing} />);
    fireEvent.press(screen.getByRole("button", { name: "Listing One" }));

    expect(onNavigateToListing).toHaveBeenCalledWith("listing-one");
  });
});
