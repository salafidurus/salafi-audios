import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { BottomAccessoryContent } from "./BottomAccessoryContent";

jest.mock("expo-audio", () => ({}));
jest.mock("expo-bottom-accessory", () => ({
  ExpoBottomAccessoryView: "ExpoBottomAccessoryView",
}));

jest.mock("@sd/domain-audio", () => ({
  ...jest.requireActual("@sd/domain-audio"),
  useAudio: jest.fn(),
}));

jest.mock("expo-router", () => ({
  usePathname: jest.fn(),
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

jest.mock("expo-image", () => ({
  Image: "Image",
}));

jest.mock("lucide-react-native", () => ({
  Play: "Play",
  Pause: "Pause",
  ChevronDown: "ChevronDown",
  Music: "Music",
  Layers: "Layers",
  Cloud: "Cloud",
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: "SafeAreaView",
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));

const { useAudio } = jest.requireMock("@sd/domain-audio");
const { usePathname } = jest.requireMock("expo-router");

const mockTrack = {
  id: "track-1",
  title: "Test Lecture",
  artist: "Shaykh Ahmad",
  durationSeconds: 3600,
  artworkUrl: "https://example.com/art.jpg",
};

describe("BottomAccessoryContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders null on routes where native tabs are absent", async () => {
    useAudio.mockReturnValue({ currentTrack: mockTrack });
    usePathname.mockReturnValue("/lecture/123");

    await render(<BottomAccessoryContent />);
    expect(screen.toJSON()).toBeNull();
  });

  it("renders null when neither miniplayer nor subroute is available", async () => {
    useAudio.mockReturnValue({ currentTrack: null });
    usePathname.mockReturnValue("/search");

    await render(<BottomAccessoryContent />);
    expect(screen.toJSON()).toBeNull();
  });

  it("renders subroute tabs only when subroute is available and no track playing", async () => {
    useAudio.mockReturnValue({ currentTrack: null });
    usePathname.mockReturnValue("/recent");

    await render(<BottomAccessoryContent />);
    expect(screen.getByTestId("subroute-only-container")).toBeTruthy();
  });

  it("renders miniplayer only when track playing and no subroute active", async () => {
    useAudio.mockReturnValue({ currentTrack: mockTrack });
    usePathname.mockReturnValue("/search");

    await render(<BottomAccessoryContent />);
    expect(screen.getByTestId("miniplayer-only-container")).toBeTruthy();
    expect(screen.getByText("Test Lecture")).toBeTruthy();
  });

  it("renders dual mode and toggles between views when both are available", async () => {
    useAudio.mockReturnValue({ currentTrack: mockTrack });
    usePathname.mockReturnValue("/recent");

    await render(<BottomAccessoryContent />);
    expect(screen.getByTestId("dual-mode-container")).toBeTruthy();
    expect(screen.getByTestId("subroute-icon-button")).toBeTruthy();

    // Toggle to expanded subroute tabs
    await fireEvent.press(screen.getByTestId("subroute-icon-button"));
    expect(screen.getByTestId("mini-player-icon-button")).toBeTruthy();
  });
});
