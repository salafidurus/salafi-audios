import { render, screen, fireEvent } from "@testing-library/react-native";
import { useProgressStore } from "@sd/domain-progress";
import { LectureSaveButtonNative } from "./LectureSaveButton";

jest.mock("../../../../shared/components/Button/Button", () => ({
  ButtonMobileNative: ({ label, onPress }: { label: string; onPress: () => void }) => {
    const { TouchableOpacity, Text } = require("react-native");
    return (
      <TouchableOpacity onPress={onPress}>
        <Text>{label}</Text>
      </TouchableOpacity>
    );
  },
}));

const initialState = useProgressStore.getState();
beforeEach(() => useProgressStore.setState(initialState, true));

describe("LectureSaveButtonNative", () => {
  it('renders "Save" when lecture is not saved', () => {
    render(<LectureSaveButtonNative lectureId="lec-1" />);
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it('renders "✓ Saved" when lecture is saved', () => {
    useProgressStore.getState().actions.addSaved("lec-1");
    render(<LectureSaveButtonNative lectureId="lec-1" />);
    expect(screen.getByText("✓ Saved")).toBeTruthy();
  });

  it("calls addSaved when pressing Save", () => {
    render(<LectureSaveButtonNative lectureId="lec-2" />);
    fireEvent.press(screen.getByText("Save"));
    expect(useProgressStore.getState().actions.isSaved("lec-2")).toBe(true);
  });

  it("calls removeSaved when pressing Saved", () => {
    useProgressStore.getState().actions.addSaved("lec-3");
    render(<LectureSaveButtonNative lectureId="lec-3" />);
    fireEvent.press(screen.getByText("✓ Saved"));
    expect(useProgressStore.getState().actions.isSaved("lec-3")).toBe(false);
  });
});
