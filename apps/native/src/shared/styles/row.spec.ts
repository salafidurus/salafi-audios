import { rowStyles } from "./row";

describe("rowStyles", () => {
  it("returns defaultRow with flexDirection row and center alignment", () => {
    const styles = rowStyles({});
    expect(styles.defaultRow).toEqual({
      flexDirection: "row",
      alignItems: "center",
    });
  });

  it("returns listRow with bottom border", () => {
    const styles = rowStyles({ borderColor: "#ccc" });
    expect(styles.listRow).toMatchObject({
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
    });
  });

  it("accepts custom gap in listRow", () => {
    const styles = rowStyles({ gap: 16, borderColor: "#ccc" });
    expect(styles.listRow.gap).toBe(16);
  });

  it("includes defaultRow from listRow", () => {
    const styles = rowStyles({ borderColor: "#ccc" });
    expect(styles.listRow.flexDirection).toBe("row");
    expect(styles.listRow.alignItems).toBe("center");
  });

  it("returns pressed style with reduced opacity", () => {
    const styles = rowStyles({});
    expect(styles.pressed).toEqual({
      opacity: 0.7,
    });
  });
});
