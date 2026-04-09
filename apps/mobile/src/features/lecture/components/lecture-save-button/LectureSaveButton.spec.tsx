import { render, screen, fireEvent } from "@testing-library/react-native";
import { useProgressStore } from "@sd/domain-progress";
import { LectureSaveButton } from "./LectureSaveButton";

jest.mock("../../../../shared/components/Button/Button", () => {
  const { TouchableOpacity, Text } = jest.requireActual("react-native");
  return {
    Button: ({ label, onPress }: { label: string; onPress: () => void }) => (
      <TouchableOpacity onPress={onPress}>
        <Text>{label}</Text>
      </TouchableOpacity>
    ),
  };
});

const initialState = useProgressStore.getState();
beforeEach(() => useProgressStore.setState(initialState, true));

describe("LectureSaveButton", () => {
  it('renders "Save" when lecture is not saved', () => {
    render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it('renders "✓ Saved" when lecture is saved', () => {
    useProgressStore.getState().actions.addSaved("lec-1");
    render(<LectureSaveButton lectureId="lec-1" />);
    expect(screen.getByText("✓ Saved")).toBeTruthy();
  });

  it("calls addSaved when pressing Save", () => {
    render(<LectureSaveButton lectureId="lec-2" />);
    fireEvent.press(screen.getByText("Save"));
    expect(useProgressStore.getState().actions.isSaved("lec-2")).toBe(true);
  });

  it("calls removeSaved when pressing Saved", () => {
    useProgressStore.getState().actions.addSaved("lec-3");
    render(<LectureSaveButton lectureId="lec-3" />);
    fireEvent.press(screen.getByText("✓ Saved"));
    expect(useProgressStore.getState().actions.isSaved("lec-3")).toBe(false);
  });
});
