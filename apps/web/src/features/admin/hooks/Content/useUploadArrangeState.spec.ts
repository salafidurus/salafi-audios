import { describe, it, expect } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { AdminArrangeDataDto } from "@sd/core-contracts";
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
      lessons: [{ op: "create", slug: "bukhari-hadith-2" }],
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
          slug: "bukhari-hadith-9",
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
  });
});
