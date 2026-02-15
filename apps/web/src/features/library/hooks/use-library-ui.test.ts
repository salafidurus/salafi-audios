import { renderHook, act } from "@testing-library/react";
import { useLibraryUi } from "./use-library-ui";
import { useLibraryUiStore } from "../store/library-ui.store";

describe("useLibraryUi", () => {
  beforeEach(() => {
    // Reset store to default before each test
    useLibraryUiStore.setState({ density: "comfortable" });
  });

  it("returns current density from store", () => {
    const { result } = renderHook(() => useLibraryUi());

    expect(result.current.density).toBe("comfortable");
  });

  it("updates density when setDensity is called", () => {
    const { result } = renderHook(() => useLibraryUi());

    act(() => {
      result.current.setDensity("compact");
    });

    expect(result.current.density).toBe("compact");
  });

  it("toggles between comfortable and compact", () => {
    const { result } = renderHook(() => useLibraryUi());

    expect(result.current.density).toBe("comfortable");

    act(() => {
      result.current.setDensity("compact");
    });
    expect(result.current.density).toBe("compact");

    act(() => {
      result.current.setDensity("comfortable");
    });
    expect(result.current.density).toBe("comfortable");
  });
});
