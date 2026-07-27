import type { AdminArrangeDataDto } from "@sd/core-contracts";

import { act, renderHook } from "@testing-library/react";
import { describe, it, expect } from "bun:test";

import {
  ROOT_MODULE_KEY,
  buildCommitDto,
  buildPresignRequest,
  localSlugConflicts,
  useUploadArrangeState,
} from "./useUploadArrangeState";

const seriesData: AdminArrangeDataDto = {
  id: "series-1",
  slug: "ajurumiyyah",
  title: "Ajurumiyyah",
  format: "series",
  scholarId: "scholar-1",
  status: "published",
  modules: [],
  lessons: [
    {
      id: "lesson-1",
      slug: "ajurumiyyah-kalam",
      title: "Al-Kalam",
      status: "published",
      orderIndex: 1,
      hasAudio: true,
    },
  ],
};

const collectionData: AdminArrangeDataDto = {
  id: "coll-1",
  slug: "bukhari",
  title: "Sahih al-Bukhari",
  format: "collection",
  scholarId: "scholar-1",
  status: "published",
  modules: [
    {
      id: "module-1",
      slug: "bukhari-ilm",
      title: "Book of Knowledge",
      status: "published",
      orderIndex: 1,
      hasAudio: false,
      lessons: [
        {
          id: "lesson-a",
          slug: "bukhari-ilm-hadith1",
          title: "Hadith 1",
          status: "published",
          orderIndex: 1,
          hasAudio: true,
        },
      ],
    },
  ],
  lessons: [],
};

function makeFile(name: string): File {
  return new File(["audio-bytes"], name, { type: "audio/mpeg" });
}

function setup(data: AdminArrangeDataDto) {
  const hook = renderHook(() => useUploadArrangeState());
  act(() => hook.result.current.dispatch({ type: "INIT_EXISTING", data }));
  return hook;
}

describe("useUploadArrangeState", () => {
  it("orders added files by numeric prefix and derives prefixed slugs", () => {
    const hook = setup(seriesData);
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [
          { file: makeFile("002 Al-Asmaa.mp3"), durationSeconds: 100 },
          { file: makeFile("001 Muqaddimah.mp3"), durationSeconds: 90 },
        ],
      }),
    );

    const { items } = hook.result.current.state;
    expect(items.map((i) => i.title)).toEqual(["Muqaddimah", "Al-Asmaa"]);
    expect(items[0]?.assignment).toMatchObject({
      kind: "new-lesson",
      slug: "ajurumiyyah-muqaddimah",
      orderIndex: 1,
    });
  });

  it("suggests replacing an existing lesson when the derived slug matches", () => {
    const hook = setup(seriesData);
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [{ file: makeFile("001 Kalam.mp3"), durationSeconds: 100 }],
      }),
    );

    const item = hook.result.current.state.items[0]!;
    expect(item.suggestion).toMatchObject({ lessonId: "lesson-1", dismissed: false });
    // Suggestion is never applied silently — the default stays "new lesson".
    expect(item.assignment.kind).toBe("new-lesson");

    act(() => hook.result.current.dispatch({ type: "ACCEPT_SUGGESTION", itemId: item.id }));
    expect(hook.result.current.state.items[0]?.assignment).toEqual({
      kind: "replace-audio",
      lessonId: "lesson-1",
    });
  });

  it("re-derives the slug on rename until the slug is manually edited", () => {
    const hook = setup(seriesData);
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [{ file: makeFile("003 Draft.mp3"), durationSeconds: 10 }],
      }),
    );
    const itemId = hook.result.current.state.items[0]!.id;

    act(() => hook.result.current.dispatch({ type: "RENAME_ITEM", itemId, title: "Al-Huruf" }));
    let assignment = hook.result.current.state.items[0]!.assignment;
    expect(assignment.kind === "new-lesson" && assignment.slug).toBe("ajurumiyyah-al-huruf");

    act(() =>
      hook.result.current.dispatch({
        type: "SET_LESSON_FIELD",
        itemId,
        field: "slug",
        value: "ajurumiyyah-custom",
      }),
    );
    act(() => hook.result.current.dispatch({ type: "RENAME_ITEM", itemId, title: "Renamed" }));
    assignment = hook.result.current.state.items[0]!.assignment;
    expect(assignment.kind === "new-lesson" && assignment.slug).toBe("ajurumiyyah-custom");
  });

  it("builds a series commit DTO with create and replace ops", () => {
    const hook = setup(seriesData);
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [
          { file: makeFile("002 Al-Asmaa.mp3"), durationSeconds: 120.6 },
          { file: makeFile("001 Kalam.mp3"), durationSeconds: 60 },
        ],
      }),
    );
    const state1 = hook.result.current.state;
    const kalamItem = state1.items.find((i) => i.title === "Kalam")!;
    act(() => hook.result.current.dispatch({ type: "ACCEPT_SUGGESTION", itemId: kalamItem.id }));
    act(() =>
      hook.result.current.dispatch({
        type: "PRESIGNED",
        urls: hook.result.current.state.items.map((item, idx) => ({
          clientId: item.id,
          uploadUrl: `https://r2/upload-${idx}`,
          objectKey: `audio/ajurumiyyah/file-${idx}.mp3`,
        })),
      }),
    );

    const dto = buildCommitDto(hook.result.current.state);
    expect(dto.modules).toBeUndefined();
    expect(dto.lessons).toHaveLength(2);
    const createOp = dto.lessons!.find((op) => op.op === "create");
    const updateOp = dto.lessons!.find((op) => op.op === "update");
    expect(createOp).toMatchObject({
      slug: "ajurumiyyah-al-asmaa",
      title: "Al-Asmaa",
      audio: { durationSeconds: 121 },
    });
    expect(updateOp).toMatchObject({ id: "lesson-1" });
  });

  it("builds a collection commit DTO grouped by module and flags unassigned items", () => {
    const hook = setup(collectionData);
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [{ file: makeFile("Hadith 2.mp3"), durationSeconds: 50 }],
      }),
    );
    const itemId = hook.result.current.state.items[0]!.id;

    // Initially unassigned (root) — a collection commit must not include it.
    expect(buildCommitDto(hook.result.current.state).modules).toEqual([]);

    act(() => hook.result.current.dispatch({ type: "ADD_MODULE", title: "Book of Faith" }));
    const tempId = hook.result.current.state.newModules[0]!.tempId;
    const current = hook.result.current.state.items[0]!;
    act(() =>
      hook.result.current.dispatch({
        type: "SET_ASSIGNMENT",
        itemId,
        assignment: {
          ...(current.assignment as Extract<
            (typeof current)["assignment"],
            { kind: "new-lesson" }
          >),
          moduleKey: `new:${tempId}`,
        },
      }),
    );

    const dto = buildCommitDto(hook.result.current.state);
    expect(dto.modules).toHaveLength(1);
    expect(dto.modules![0]).toMatchObject({
      op: "create",
      slug: "bukhari-book-of-faith",
      // Prefixed by its immediate parent module's slug, not just the root's.
      lessons: [{ op: "create", slug: "bukhari-book-of-faith-hadith-2" }],
    });
  });

  it("reports local slug conflicts against existing children and staged duplicates", () => {
    const hook = setup(seriesData);
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [{ file: makeFile("Kalam.mp3"), durationSeconds: 10 }],
      }),
    );
    // Derived slug equals the existing lesson slug → conflict.
    expect(localSlugConflicts(hook.result.current.state)).toEqual(["ajurumiyyah-kalam"]);
  });

  it("builds the presign request from staged items", () => {
    const hook = setup(seriesData);
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [{ file: makeFile("004 Ishara.mp3"), durationSeconds: 10 }],
      }),
    );
    const request = buildPresignRequest(hook.result.current.state);
    expect(request.rootSlug).toBe("ajurumiyyah");
    expect(request.files).toEqual([
      {
        clientId: hook.result.current.state.items[0]!.id,
        filename: "004 Ishara.mp3",
        contentType: "audio/mpeg",
        slug: "ajurumiyyah-ishara",
      },
    ]);
  });

  it("keeps items visible when their staged module is removed", () => {
    const hook = setup(collectionData);
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [{ file: makeFile("Hadith 9.mp3"), durationSeconds: 10 }],
      }),
    );
    act(() => hook.result.current.dispatch({ type: "ADD_MODULE", title: "Temp Module" }));
    const tempId = hook.result.current.state.newModules[0]!.tempId;
    const item = hook.result.current.state.items[0]!;
    act(() =>
      hook.result.current.dispatch({
        type: "SET_ASSIGNMENT",
        itemId: item.id,
        assignment: {
          kind: "new-lesson",
          moduleKey: `new:${tempId}`,
          // Module-prefixed slug ("temp-module-hadith-9"), not root-prefixed.
          slug: "bukhari-temp-module-hadith-9",
          slugEdited: false,
          description: "",
          status: "draft",
          orderIndex: 1,
        },
      }),
    );
    act(() => hook.result.current.dispatch({ type: "REMOVE_MODULE", tempId }));

    const after = hook.result.current.state.items[0]!.assignment;
    expect(after.kind === "new-lesson" && after.moduleKey).toBe(ROOT_MODULE_KEY);
    expect(hook.result.current.state.newModules).toHaveLength(0);
    // Falling back to root must re-prefix with the root's slug, not keep the
    // removed module's stale prefix.
    expect(after.kind === "new-lesson" && after.slug).toBe("bukhari-hadith-9");
  });

  it("does not overwrite a manually-edited slug when its module is removed", () => {
    const hook = setup(collectionData);
    act(() =>
      hook.result.current.dispatch({
        type: "ADD_FILES",
        files: [{ file: makeFile("Hadith 9.mp3"), durationSeconds: 10 }],
      }),
    );
    act(() => hook.result.current.dispatch({ type: "ADD_MODULE", title: "Temp Module" }));
    const tempId = hook.result.current.state.newModules[0]!.tempId;
    const item = hook.result.current.state.items[0]!;
    act(() =>
      hook.result.current.dispatch({
        type: "SET_ASSIGNMENT",
        itemId: item.id,
        assignment: {
          kind: "new-lesson",
          moduleKey: `new:${tempId}`,
          slug: "custom-manual-slug",
          slugEdited: true,
          description: "",
          status: "draft",
          orderIndex: 1,
        },
      }),
    );
    act(() => hook.result.current.dispatch({ type: "REMOVE_MODULE", tempId }));

    const after = hook.result.current.state.items[0]!.assignment;
    expect(after.kind === "new-lesson" && after.slug).toBe("custom-manual-slug");
  });

  describe("immediate-parent slug prefix on reassignment", () => {
    it("recomputes the slug against an existing module's slug when reassigned to it", () => {
      const hook = setup(collectionData);
      act(() =>
        hook.result.current.dispatch({
          type: "ADD_FILES",
          files: [{ file: makeFile("Hadith 9.mp3"), durationSeconds: 10 }],
        }),
      );
      const item = hook.result.current.state.items[0]!;
      expect(item.assignment.kind === "new-lesson" && item.assignment.slug).toBe(
        "bukhari-hadith-9",
      );

      act(() =>
        hook.result.current.dispatch({
          type: "SET_ASSIGNMENT",
          itemId: item.id,
          assignment: {
            kind: "new-lesson",
            moduleKey: "module-1",
            slug: item.assignment.kind === "new-lesson" ? item.assignment.slug : "",
            slugEdited: false,
            description: "",
            status: "draft",
            orderIndex: 1,
          },
        }),
      );

      const after = hook.result.current.state.items[0]!.assignment;
      // module-1's slug is "bukhari-ilm" — the immediate parent, not the root "bukhari".
      expect(after.kind === "new-lesson" && after.slug).toBe("bukhari-ilm-hadith-9");
    });

    it("recomputes the slug against a newly-staged module's slug when reassigned to it", () => {
      const hook = setup(collectionData);
      act(() =>
        hook.result.current.dispatch({
          type: "ADD_FILES",
          files: [{ file: makeFile("Hadith 9.mp3"), durationSeconds: 10 }],
        }),
      );
      act(() => hook.result.current.dispatch({ type: "ADD_MODULE", title: "New Chapter" }));
      const tempId = hook.result.current.state.newModules[0]!.tempId;
      const item = hook.result.current.state.items[0]!;

      act(() =>
        hook.result.current.dispatch({
          type: "SET_ASSIGNMENT",
          itemId: item.id,
          assignment: {
            kind: "new-lesson",
            moduleKey: `new:${tempId}`,
            slug: item.assignment.kind === "new-lesson" ? item.assignment.slug : "",
            slugEdited: false,
            description: "",
            status: "draft",
            orderIndex: 1,
          },
        }),
      );

      const after = hook.result.current.state.items[0]!.assignment;
      expect(after.kind === "new-lesson" && after.slug).toBe("bukhari-new-chapter-hadith-9");
    });

    it("does not overwrite a manually-edited slug on reassignment", () => {
      const hook = setup(collectionData);
      act(() =>
        hook.result.current.dispatch({
          type: "ADD_FILES",
          files: [{ file: makeFile("Hadith 9.mp3"), durationSeconds: 10 }],
        }),
      );
      const item = hook.result.current.state.items[0]!;
      act(() =>
        hook.result.current.dispatch({
          type: "SET_LESSON_FIELD",
          itemId: item.id,
          field: "slug",
          value: "my-custom-slug",
        }),
      );

      act(() =>
        hook.result.current.dispatch({
          type: "SET_ASSIGNMENT",
          itemId: item.id,
          assignment: {
            kind: "new-lesson",
            moduleKey: "module-1",
            slug: "my-custom-slug",
            slugEdited: true,
            description: "",
            status: "draft",
            orderIndex: 1,
          },
        }),
      );

      const after = hook.result.current.state.items[0]!.assignment;
      expect(after.kind === "new-lesson" && after.slug).toBe("my-custom-slug");
    });
  });

  describe("EDIT_MODULE title/slug cascade", () => {
    it("recomputes a staged module's own slug when its title changes, and cascades to its children", () => {
      const hook = setup(collectionData);
      act(() => hook.result.current.dispatch({ type: "ADD_MODULE", title: "Book of Faith" }));
      const tempId = hook.result.current.state.newModules[0]!.tempId;
      expect(hook.result.current.state.newModules[0]!.slug).toBe("bukhari-book-of-faith");

      act(() =>
        hook.result.current.dispatch({
          type: "ADD_FILES",
          files: [{ file: makeFile("Hadith 9.mp3"), durationSeconds: 10 }],
        }),
      );
      const item = hook.result.current.state.items[0]!;
      act(() =>
        hook.result.current.dispatch({
          type: "SET_ASSIGNMENT",
          itemId: item.id,
          assignment: {
            kind: "new-lesson",
            moduleKey: `new:${tempId}`,
            slug: "placeholder",
            slugEdited: false,
            description: "",
            status: "draft",
            orderIndex: 1,
          },
        }),
      );

      act(() =>
        hook.result.current.dispatch({
          type: "EDIT_MODULE",
          tempId,
          field: "title",
          value: "Book of Iman",
        }),
      );

      expect(hook.result.current.state.newModules[0]!.slug).toBe("bukhari-book-of-iman");
      const after = hook.result.current.state.items[0]!.assignment;
      expect(after.kind === "new-lesson" && after.slug).toBe("bukhari-book-of-iman-hadith-9");
    });

    it("preserves a manually-edited module slug and does not re-derive it from title changes", () => {
      const hook = setup(collectionData);
      act(() => hook.result.current.dispatch({ type: "ADD_MODULE", title: "Book of Faith" }));
      const tempId = hook.result.current.state.newModules[0]!.tempId;

      act(() =>
        hook.result.current.dispatch({
          type: "EDIT_MODULE",
          tempId,
          field: "slug",
          value: "bukhari-custom-module",
        }),
      );
      act(() =>
        hook.result.current.dispatch({
          type: "EDIT_MODULE",
          tempId,
          field: "title",
          value: "Renamed",
        }),
      );

      expect(hook.result.current.state.newModules[0]!.slug).toBe("bukhari-custom-module");
    });
  });

  describe("ADD_URL_ITEMS", () => {
    it("stages url items pending (no bytes fetched yet) using their resolved metadata", () => {
      const hook = setup(seriesData);
      act(() =>
        hook.result.current.dispatch({
          type: "ADD_URL_ITEMS",
          items: [
            {
              url: "https://archive.org/download/Item/001 Muqaddimah.mp3",
              filename: "001 Muqaddimah.mp3",
              contentType: "audio/mpeg",
              sizeBytes: 5_000_000,
              durationSeconds: 90,
            },
          ],
        }),
      );

      const item = hook.result.current.state.items[0]!;
      expect(item.source).toEqual({
        kind: "url",
        url: "https://archive.org/download/Item/001 Muqaddimah.mp3",
      });
      expect(item.title).toBe("Muqaddimah");
      expect(item.sizeBytes).toBe(5_000_000);
      expect(item.durationSeconds).toBe(90);
      expect(item.upload).toEqual({ status: "pending", percent: 0 });
    });

    it("orders url items by numeric prefix exactly like ADD_FILES", () => {
      const hook = setup(seriesData);
      act(() =>
        hook.result.current.dispatch({
          type: "ADD_URL_ITEMS",
          items: [
            {
              url: "https://example.com/002.mp3",
              filename: "002 Al-Asmaa.mp3",
              contentType: "audio/mpeg",
              sizeBytes: 100,
              durationSeconds: 10,
            },
            {
              url: "https://example.com/001.mp3",
              filename: "001 Muqaddimah.mp3",
              contentType: "audio/mpeg",
              sizeBytes: 100,
              durationSeconds: 10,
            },
          ],
        }),
      );

      expect(hook.result.current.state.items.map((i) => i.title)).toEqual([
        "Muqaddimah",
        "Al-Asmaa",
      ]);
    });

    it("builds the presign request from the item's filename, regardless of source", () => {
      const hook = setup(seriesData);
      act(() =>
        hook.result.current.dispatch({
          type: "ADD_URL_ITEMS",
          items: [
            {
              url: "https://example.com/004.mp3",
              filename: "004 Ishara.mp3",
              contentType: "audio/mpeg",
              sizeBytes: 100,
              durationSeconds: 10,
            },
          ],
        }),
      );

      const request = buildPresignRequest(hook.result.current.state);
      expect(request.files).toEqual([
        {
          clientId: hook.result.current.state.items[0]!.id,
          filename: "004 Ishara.mp3",
          contentType: "audio/mpeg",
          slug: "ajurumiyyah-ishara",
        },
      ]);
    });

    it("enforces the single-file guard the same as ADD_FILES", () => {
      const singleData: AdminArrangeDataDto = { ...seriesData, format: "single" };
      const hook = setup(singleData);
      act(() =>
        hook.result.current.dispatch({
          type: "ADD_URL_ITEMS",
          items: [
            {
              url: "https://example.com/a.mp3",
              filename: "a.mp3",
              contentType: "audio/mpeg",
              sizeBytes: 100,
              durationSeconds: 10,
            },
            {
              url: "https://example.com/b.mp3",
              filename: "b.mp3",
              contentType: "audio/mpeg",
              sizeBytes: 100,
              durationSeconds: 10,
            },
          ],
        }),
      );

      expect(hook.result.current.state.items).toHaveLength(0);
      expect(hook.result.current.state.error).toBeTruthy();
    });
  });
});
