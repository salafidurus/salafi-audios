import { describe, expect, it } from "bun:test";

import { parseScholarPageFeedDto, ScholarPageFeedDtoSchema } from "./scholar-page-feed.types";

const scholar = {
  id: "scholar-1",
  slug: "ibn-baz",
  name: "Ibn Baz",
  title: "allamah" as const,
  lectureCount: 12,
};

describe("Scholar page feed contract", () => {
  it("accepts a versioned ordered Allamah scholars batch", () => {
    const result = ScholarPageFeedDtoSchema.parse({
      schemaVersion: 1,
      batches: [
        {
          form: "scholars",
          id: "scholars:allamah",
          title: { kind: "allamah", id: "allamah_scholars", label: "Allamah scholars" },
          items: [scholar],
        },
      ],
      exhausted: true,
    });

    expect(result.batches[0]?.items).toEqual([scholar]);
  });

  it("keeps supported batches while ignoring unknown future forms", () => {
    const result = parseScholarPageFeedDto({
      schemaVersion: 1,
      batches: [
        {
          form: "future_form",
          id: "future:1",
          title: { kind: "future", id: "future", label: "Future" },
          items: [],
        },
        {
          form: "scholars",
          id: "scholars:allamah",
          title: { kind: "allamah", id: "allamah_scholars", label: "Allamah scholars" },
          items: [scholar],
        },
      ],
      exhausted: true,
    });

    expect(result.batches).toHaveLength(1);
    expect(result.batches[0]?.form).toBe("scholars");
  });

  it("rejects a scholars batch with a non-Allamah title context", () => {
    expect(() =>
      ScholarPageFeedDtoSchema.parse({
        schemaVersion: 1,
        batches: [
          {
            form: "scholars",
            id: "scholars:allamah",
            title: { kind: "senior", id: "senior_scholars", label: "Senior scholars" },
            items: [scholar],
          },
        ],
        exhausted: true,
      }),
    ).toThrow();
  });
});
