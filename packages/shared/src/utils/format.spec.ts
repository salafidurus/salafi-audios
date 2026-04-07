import { formatDuration, formatCompactNumber } from "./format.desktop.web";

describe("formatDuration", () => {
  it("returns empty string for undefined", () => {
    expect(formatDuration(undefined)).toBe("");
  });
  it("returns empty string for 0", () => {
    expect(formatDuration(0)).toBe("");
  });
  it("returns empty string for negative values", () => {
    expect(formatDuration(-10)).toBe("");
  });
  it("returns empty string for seconds-only values (< 60s)", () => {
    expect(formatDuration(30)).toBe("");
  });
  it("formats exact minutes", () => {
    expect(formatDuration(60)).toBe("1m");
  });
  it("floors partial minutes", () => {
    expect(formatDuration(90)).toBe("1m");
  });
  it("formats hours with zero-padded minutes", () => {
    expect(formatDuration(3600)).toBe("1hr 00m");
  });
  it("formats hours with non-zero minutes", () => {
    expect(formatDuration(3660)).toBe("1hr 01m");
  });
  it("formats multi-hour durations", () => {
    expect(formatDuration(7322)).toBe("2hr 02m");
  });
});

describe("formatCompactNumber", () => {
  it("returns plain string for 0", () => {
    expect(formatCompactNumber(0)).toBe("0");
  });
  it("returns plain string for values under 1000", () => {
    expect(formatCompactNumber(999)).toBe("999");
  });
  it("formats even thousands without decimal", () => {
    expect(formatCompactNumber(1000)).toBe("1k");
  });
  it("formats fractional thousands with one decimal", () => {
    expect(formatCompactNumber(1500)).toBe("1.5k");
  });
  it("formats tens of thousands without decimal", () => {
    expect(formatCompactNumber(10000)).toBe("10k");
  });
  it("formats even millions without decimal", () => {
    expect(formatCompactNumber(1000000)).toBe("1M");
  });
});