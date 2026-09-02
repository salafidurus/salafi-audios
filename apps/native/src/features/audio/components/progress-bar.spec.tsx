import { render, fireEvent, screen } from "@testing-library/react-native";
import React from "react";

import { ProgressBar } from "./progress-bar";

jest.mock("@sd/domain-audio", () => ({
  useAudio: jest.fn(),
}));

jest.mock("../audio-service", () => ({
  audioService: { seek: jest.fn() },
}));

const { useAudio } = jest.requireMock("@sd/domain-audio");
const { audioService } = jest.requireMock("../audio-service");

describe("ProgressBar", () => {
  beforeEach(() => jest.clearAllMocks());

  it("seeks using the native slider value", async () => {
    useAudio.mockReturnValue({ positionSeconds: 30, durationSeconds: 120 });

    await render(<ProgressBar />);
    fireEvent(screen.getByTestId("audio-progress-bar"), "onValueChange", 75);

    expect(audioService.seek).toHaveBeenCalledWith(75);
  });

  it("disables seeking when duration is unavailable", async () => {
    useAudio.mockReturnValue({ positionSeconds: 0, durationSeconds: 0 });

    await render(<ProgressBar />);

    expect(screen.getByTestId("audio-progress-bar").props.disabled).toBe(true);
  });
});
