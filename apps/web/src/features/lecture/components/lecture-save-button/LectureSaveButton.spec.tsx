import { render, screen, fireEvent } from "@testing-library/react";
import { useProgressStore } from "@sd/domain-audio";
import { LectureSaveButton } from "./LectureSaveButton";

const initialState = useProgressStore.getState();
beforeEach(() => useProgressStore.setState(initialState, true));

describe("LectureSaveButton", () => {
  it('renders "Save" when lecture is not saved', () => {
    render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it('renders "✓ Saved" when lecture is saved', () => {
    useProgressStore.getState().actions.addSaved("lec-1");
    render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByText("✓ Saved")).toBeInTheDocument();
  });

  it("calls addSaved when clicking Save", () => {
    render(<LectureSaveButton lectureId="lec-2" />);
    fireEvent.click(screen.getByText("Save"));
    expect(useProgressStore.getState().actions.isSaved("lec-2")).toBe(true);
  });

  it("calls removeSaved when clicking Saved", () => {
    useProgressStore.getState().actions.addSaved("lec-3");
    render(<LectureSaveButton lectureId="lec-3" />);
    fireEvent.click(screen.getByText("✓ Saved"));
    expect(useProgressStore.getState().actions.isSaved("lec-3")).toBe(false);
  });
});
