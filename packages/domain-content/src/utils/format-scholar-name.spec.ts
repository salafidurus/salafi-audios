import { describe, expect, it } from "bun:test";
import { formatScholarName } from "./format-scholar-name";

describe("formatScholarName", () => {
  it("formats scholar name with 'sheikh' title object", () => {
    expect(formatScholarName({ name: "Salih al-Fawzan", title: "sheikh" })).toBe(
      "Sheikh Salih al-Fawzan",
    );
  });

  it("formats scholar name with 'allamah' title object", () => {
    expect(formatScholarName({ name: "Muhammad Nasiruddin al-Albani", title: "allamah" })).toBe(
      "Shaykh Allamah Muhammad Nasiruddin al-Albani",
    );
  });

  it("formats scholar name with 'ustadh' title object", () => {
    expect(formatScholarName({ name: "Zayd bin Ali", title: "ustadh" })).toBe(
      "Ustadh Zayd bin Ali",
    );
  });

  it("formats scholar name with 'akh' title object", () => {
    expect(formatScholarName({ name: "Tariq bin Abdallah", title: "akh" })).toBe(
      "Akh Tariq bin Abdallah",
    );
  });

  it("returns plain name when title is missing or null", () => {
    expect(formatScholarName({ name: "Salih al-Fawzan", title: undefined })).toBe(
      "Salih al-Fawzan",
    );
    expect(formatScholarName({ name: "Salih al-Fawzan", title: null })).toBe("Salih al-Fawzan");
  });

  it("formats string name with title parameter", () => {
    expect(formatScholarName("Salih al-Fawzan", "sheikh")).toBe("Sheikh Salih al-Fawzan");
  });

  it("prevents double-prefixing if name already starts with title display", () => {
    expect(formatScholarName("Sheikh Salih al-Fawzan", "sheikh")).toBe("Sheikh Salih al-Fawzan");
    expect(formatScholarName("Shaykh Allamah Muhammad Nasiruddin al-Albani", "allamah")).toBe(
      "Shaykh Allamah Muhammad Nasiruddin al-Albani",
    );
  });

  it("handles null or undefined input gracefully", () => {
    expect(formatScholarName(null)).toBe("");
    expect(formatScholarName(undefined)).toBe("");
  });
});
