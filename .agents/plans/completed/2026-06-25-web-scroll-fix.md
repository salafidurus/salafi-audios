# Metadata

- **Date:** 2026-06-25
- **Status:** Completed
- **Scope:** `apps/web` — layout and screen components only
- **Summary:** Several web screens that should scroll vertically do not scroll. The root cause is
  `min-height: 100%` on `ScreenView.container` fighting the flex scroll chain in `.appContent`.
  Two library screens also render without a `ScreenView` wrapper at all, bypassing the scroll
  context entirely. This plan fixes both issues without touching any other behaviour.
- **Dependencies:** None. Standalone bug fix; no other plan must complete first.

---

# Worktree Requirement

> **All implementation work for this plan must be done in a git worktree.**
>
> Do not implement directly on the main working tree. Create a worktree branch first:
>
> ```bash
> git worktree add .worktrees/fix/web-scroll-fix -b fix/web-scroll-fix
> ```
>
> Work exclusively in `.worktrees/fix/web-scroll-fix`. When all stages are complete and the
> final verification passes, open a PR from `fix/web-scroll-fix` into the main branch and
> remove the worktree after merge.

---

# Background and Diagnosis

During a UI review session on 2026-06-25, the user flagged that several screens which should
scroll vertically were not scrolling at all. Code inspection identified two independent root
causes.

## Root Cause 1 — `ScreenView.container` has `min-height: 100%`

The app layout flex chain is:

```
.appFrame   { height: 100vh; overflow: hidden; }
  .appShell { flex: 1; min-height: 0; }
    .appMain { flex: 1; flex-direction: column; min-height: 0; }
      .appContent { flex: 1; overflow-y: auto; min-height: 0; }  ← intended scroll container
        ScreenView.container { flex: 1; min-height: 100%; }       ← PROBLEM
```

`min-height: 100%` on `.container` resolves against the _constrained_ height of `.appContent`
(which is `flex: 1; min-height: 0`, not an intrinsic height). This collapses the scroll region:
`.appContent` sees its child as fitting within it, so `overflow-y: auto` never activates. The
fix is to remove `min-height: 100%` — `flex: 1` is already present and handles short content
(stretching to fill available space). Tall content will naturally exceed the flex container,
and `.appContent`'s scroll will activate.

**Screens affected:** Feed, Scholar List, Scholar Detail, Listing Detail, Live, Account — any
screen using `ScreenView`.

## Root Cause 2 — Library screens bypass `ScreenView` entirely

`LibrarySavedDesktopScreen` and `LibraryCompletedDesktopScreen` render a bare `<div>` as their
root. They never enter the `ScreenView` → `.appContent` scroll chain at all. They need to be
wrapped in `<ScreenView>`.

---

# Progress

- **Done:** Root cause identified via code inspection. No code changes made yet.
- **Blocked / Uncertain:** None currently identified.
- **Next step:** Create worktree, then execute Stage 1 (fix `ScreenView` CSS).

---

# Staging Strategy

Two small, independently committable stages:

1. Fix `ScreenView.container` — remove `min-height: 100%`; this unblocks scrolling for every
   screen that already uses `ScreenView`.
2. Wrap bare Library screens in `ScreenView` — `library-saved` and `library-completed` desktop
   screens render a raw `<div>` and miss the scroll context entirely.

---

## Stage 1: Fix ScreenView container min-height

- **Status:** Planned

### Goal

Remove `min-height: 100%` from `.container` in `screen-view.module.css`. See the diagnosis
in the Background section above for the full explanation of why this property breaks scroll.

### Files

- `apps/web/src/shared/components/ScreenView/screen-view.module.css`

### Changes

```diff
 .container {
   flex: 1;
   background-color: var(--surface-canvas);
   padding: var(--space-layout-page-y) var(--space-layout-page-x);
-  min-height: 100%;
 }
```

### Blockers

None currently identified.

### Dependencies

None. This is the foundational fix; Stage 2 depends on it being applied first.

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes (no regressions in `ScreenView` unit tests if any exist).
- Manual smoke test: Feed, Scholar List, Scholar Detail, and Listing Detail pages scroll
  vertically when content exceeds the viewport.
- Short-content screens (sign-in, empty states) still fill the viewport — no layout gap.

### Suggested Commit Message

```
fix(web): remove min-height 100% from ScreenView to restore scroll

ScreenView.container had `min-height: 100%` which resolved against the
constrained flex parent (.appContent, min-height: 0), collapsing the
overflow-y: auto scroll region. Removing it lets content height drive
the scroll naturally.

Fixes scrolling on Feed, Scholar List, Scholar Detail, and all other
screens that use ScreenView.
```

---

## Stage 2: Wrap bare Library screens in ScreenView

- **Status:** Planned

### Goal

`LibrarySavedDesktopScreen` and `LibraryCompletedDesktopScreen` render a bare `<div>` as their
root — they never enter the `ScreenView` scroll context. Wrap them in `<ScreenView>` so they
inherit consistent padding, background, and scroll behaviour.

Note: this overlaps with Stage 7 of the redesign plan (`2026-06-25-web-ui-redesign.md`), which
also wraps these screens. Coordinate before executing to avoid duplicate work — if the redesign
plan Stage 7 is executed first, this stage becomes redundant and should be marked `Cancelled`.

### Files

- `apps/web/src/features/library/screens/library-saved.screen.desktop.tsx`
- `apps/web/src/features/library/screens/library-completed.screen.desktop.tsx`

### Changes

**`library-saved.screen.desktop.tsx`** — wrap the return value in `<ScreenView>`:

```diff
+import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
 ...
 return (
-  <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
-    ...
-  </div>
+  <ScreenView>
+    <div style={{ maxWidth: 720, margin: "0 auto" }}>
+      ...
+    </div>
+  </ScreenView>
 );
```

Note: remove `padding: 24` from the inner `<div>` — `ScreenView` already applies
`--space-layout-page-y / --space-layout-page-x` padding.

Apply the same pattern to `library-completed.screen.desktop.tsx`. The loading and empty-state
`<div>` branches also need to be wrapped.

### Blockers

Depends on Stage 1 being committed first (or applied in the same PR).

### Dependencies

Stage 1 must be complete so that wrapping in `ScreenView` actually produces correct scroll
behaviour.

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes.
- Manual smoke test: Library Saved and Library Completed pages scroll when the list of items
  exceeds the viewport height.

### Suggested Commit Message

```
fix(web): wrap bare Library screens in ScreenView for consistent scroll

LibrarySavedDesktopScreen and LibraryCompletedDesktopScreen rendered a
bare <div> as their root, bypassing the ScreenView scroll context. Wrap
both in <ScreenView> and remove redundant padding from the inner div.
```

---

# Final Verification

After both stages are committed:

- `pnpm --filter web typecheck` passes with no new errors.
- `pnpm --filter web test` passes with no regressions.
- `pnpm --filter web lint` passes with no new violations.
- Manual smoke test across all affected screens (desktop viewport):
  - `/feed` — long feed list scrolls.
  - `/scholars` — long scholar grid scrolls.
  - `/scholars/[slug]` — scholar content list scrolls; sticky sidebar remains visible.
  - `/library/saved` — saved list scrolls.
  - `/library/completed` — completed list scrolls.
  - Short-content screens (e.g. sign-in, empty states) still fill the viewport without
    whitespace gaps or layout shift.

---

# Plan Completion

The plan is `Completed` when:

1. Both stages are committed to the main branch (or a single combined PR is merged).
2. All final verification checks pass.
3. No scrolling regressions are observed on any screen during the manual smoke test.
4. The worktree branch is removed after merge.

Move this file to `.agents/plans/completed/` and update `Status` to `Completed`.
