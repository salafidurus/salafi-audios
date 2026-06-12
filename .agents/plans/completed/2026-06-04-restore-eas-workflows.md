# Restore EAS Workflows for apps/native Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the three EAS workflow YAML files that were deleted during the `apps/mobile` → `apps/native` migration, updated to reference `apps/native` paths.

**Architecture:** The workflows lived at `apps/mobile/.eas/workflows/` and were deleted in commit `e69ddaa`. They need to be recreated at `apps/native/.eas/workflows/` with `apps/mobile` path references swapped to `apps/native`. The `eas.json` is already in place at `apps/native/eas.json` with matching profiles (`development`, `preview`, `production`).

**Tech Stack:** EAS Workflows (YAML), Expo EAS CLI, fingerprint-based runtime versioning

---

## Background: What Was Lost

Three workflow files were deleted in commit `e69ddaa` (Apr 12, 2026) as part of the `apps/mobile` → `apps/native` migration:

| File                   | Purpose                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `production-build.yml` | Triggers Android production build when a PR to `production` branch is labeled `build-all` or `build-android`          |
| `staging.yml`          | Fingerprint-based smart preview: reuses existing build or creates new one; publishes OTA if build already exists      |
| `production-ota.yml`   | Hotfix-only OTA: publishes production OTA update when a `hotfix/*` branch has a matching production build fingerprint |

## File Structure

```text
apps/native/
  .eas/
    workflows/
      production-build.yml   ← CREATE (was apps/mobile/.eas/workflows/production-build.yml)
      staging.yml            ← CREATE (was apps/mobile/.eas/workflows/staging.yml)
      production-ota.yml     ← CREATE (was apps/mobile/.eas/workflows/production-ota.yml)
  eas.json                   ← EXISTS (profiles: development, preview, production)
```

---

## Task 1: Restore `production-build.yml`

**Files:**

- Create: `apps/native/.eas/workflows/production-build.yml`

This workflow triggers on labeled PRs to the `production` branch and runs an Android production build. iOS is commented out pending Apple credentials setup.

- [ ] **Step 1: Create the workflow file**

Create `apps/native/.eas/workflows/production-build.yml`:

```yaml
name: Production Release Build

on:
  pull_request:
    branches:
      - production
    types:
      - labeled
    paths:
      - apps/native/src/**
      - apps/native/app.config.ts
      - apps/native/package.json
      - apps/native/assets/**

concurrency:
  cancel_in_progress: true
  group: ${{ workflow.filename }}-${{ github.ref }}

jobs:
  build_android_if_labeled:
    name: Build Android (production)
    if: ${{ github.event.label.name == 'build-all' || github.event.label.name == 'build-android' }}
    type: build
    environment: production
    env:
      EXPO_DEBUG: "1"
    params:
      platform: android
      profile: production

  # build_ios_if_labeled:
  #   name: Build iOS (production)
  #   if: ${{ github.event.label.name == 'build-all' || github.event.label.name == 'build-ios' }}
  #   type: build
  #   environment: production
  #   env:
  #     EXPO_DEBUG: "1"
  #   params:
  #     platform: ios
  #     profile: production
```

- [ ] **Step 2: Validate the workflow file**

```bash
node "$(dirname $(which node))/../lib/node_modules/eas-cli/bin/run" workflow:validate apps/native/.eas/workflows/production-build.yml --non-interactive 2>&1 || true
```

If `eas` CLI not available, use the skill's validate script:

```bash
node C:/Users/olanr/.claude/plugins/cache/expo-plugins/expo/1.0.0/skills/expo-cicd-workflows/scripts/validate.js apps/native/.eas/workflows/production-build.yml
```

Expected: No validation errors.

- [ ] **Step 3: Commit**

```bash
git add apps/native/.eas/workflows/production-build.yml
git commit -m "chore(eas): restore production-build workflow for apps/native"
```

---

## Task 2: Restore `staging.yml`

**Files:**

- Create: `apps/native/.eas/workflows/staging.yml`

This is the smart staging workflow. It computes a fingerprint, checks if an existing preview build matches it, and either publishes an OTA update (faster) or creates a new build (when native code changed).

- [ ] **Step 1: Create the workflow file**

Create `apps/native/.eas/workflows/staging.yml`:

```yaml
name: Staging PR Preview (EAS)

on:
  pull_request:
    branches:
      - preview
    paths:
      - apps/native/src/**
      - apps/native/app.config.ts
      - apps/native/package.json
      - apps/native/assets/**

concurrency:
  cancel_in_progress: true
  group: ${{ workflow.filename }}-${{ github.ref }}

jobs:
  fingerprint:
    name: Compute fingerprint (Android/iOS)
    type: fingerprint
    environment: preview
    env:
      EXPO_DEBUG: "1"

  # 1) Check if an Android build exists that matches this fingerprint runtime
  get_android_build:
    name: Check for existing Android build (fingerprint runtime)
    needs: [fingerprint]
    type: get-build
    params:
      platform: android
      profile: preview
      fingerprint_hash: ${{ needs.fingerprint.outputs.android_fingerprint_hash }}

  # 2) If Android build exists => push OTA update
  update_android_if_build:
    name: Publish preview update (Android, if build exists)
    needs: [get_android_build]
    if: ${{ needs.get_android_build.outputs.build_id }}
    type: update
    environment: preview
    env:
      EXPO_DEBUG: "1"
    params:
      platform: android
      channel: preview
      message: "Preview update for PR #${{ github.event.pull_request.number }}"

  # 3) If Android build missing => create one
  build_android_if_missing:
    name: Build Android (if no build matches this fingerprint runtime)
    needs: [get_android_build]
    if: ${{ !needs.get_android_build.outputs.build_id }}
    type: build
    environment: preview
    env:
      EXPO_DEBUG: "1"
    params:
      platform: android
      profile: preview

  # ---------------------------
  # iOS (kept commented for later)
  # ---------------------------

  # # 1) Check if an iOS build exists that matches this fingerprint runtime
  # get_ios_build:
  #   name: Check for existing iOS build (fingerprint runtime)
  #   needs: [fingerprint]
  #   type: get-build
  #   params:
  #     platform: ios
  #     profile: preview
  #     fingerprint_hash: ${{ needs.fingerprint.outputs.ios_fingerprint_hash }}

  # # 2) If iOS build exists => push OTA update
  # update_ios_if_build:
  #   name: Publish preview update (iOS, if build exists)
  #   needs: [get_ios_build]
  #   if: ${{ needs.get_ios_build.outputs.build_id }}
  #   type: update
  #   environment: preview
  #   env:
  #     EXPO_DEBUG: "1"
  #   params:
  #     platform: ios
  #     channel: preview
  #     message: "Preview update for PR #${{ github.event.pull_request.number }}"

  # # 3) If iOS build missing => create one
  # build_ios_if_missing:
  #   name: Build iOS (if no build matches this fingerprint runtime)
  #   needs: [get_ios_build]
  #   if: ${{ !needs.get_ios_build.outputs.build_id }}
  #   type: build
  #   environment: preview
  #   env:
  #     EXPO_DEBUG: "1"
  #   params:
  #     platform: ios
  #     profile: preview
```

- [ ] **Step 2: Validate the workflow file**

```bash
node C:/Users/olanr/.claude/plugins/cache/expo-plugins/expo/1.0.0/skills/expo-cicd-workflows/scripts/validate.js apps/native/.eas/workflows/staging.yml
```

Expected: No validation errors.

- [ ] **Step 3: Commit**

```bash
git add apps/native/.eas/workflows/staging.yml
git commit -m "chore(eas): restore staging preview workflow for apps/native"
```

---

## Task 3: Restore `production-ota.yml`

**Files:**

- Create: `apps/native/.eas/workflows/production-ota.yml`

This workflow only fires for `hotfix/*` branches targeting `production`. It finds the production build matching the current fingerprint and, if found, pushes an OTA update — no new build required.

- [ ] **Step 1: Create the workflow file**

Create `apps/native/.eas/workflows/production-ota.yml`:

```yaml
name: Production Hotfix OTA

on:
  pull_request:
    branches:
      - production
    types:
      - opened
      - synchronize
      - reopened
    paths:
      - apps/native/src/**
      - apps/native/assets/**

concurrency:
  cancel_in_progress: true
  group: ${{ workflow.filename }}-${{ github.ref }}

jobs:
  fingerprint:
    name: Compute fingerprint (Android/iOS)
    if: ${{ startsWith(github.event.pull_request.head.ref, 'hotfix/') }}
    type: fingerprint
    environment: production
    env:
      EXPO_DEBUG: "1"

  get_android_build:
    name: Find production Android build matching fingerprint
    needs: [fingerprint]
    if: ${{ needs.fingerprint.result == 'success' }}
    type: get-build
    params:
      platform: android
      profile: production
      fingerprint_hash: ${{ needs.fingerprint.outputs.android_fingerprint_hash }}

  update_android_hotfix_if_build:
    name: Publish production OTA (Android hotfix, only if build exists)
    needs: [get_android_build]
    if: ${{ needs.get_android_build.outputs.build_id }}
    type: update
    environment: production
    env:
      EXPO_DEBUG: "1"
    params:
      platform: android
      channel: production
      message: "Hotfix PR #${{ github.event.pull_request.number }}"

  # ---------------------------
  # iOS (kept commented for later)
  # ---------------------------

  # get_ios_build:
  #   name: Find production iOS build matching fingerprint
  #   needs: [fingerprint]
  #   if: ${{ needs.fingerprint.result == 'success' }}
  #   type: get-build
  #   params:
  #     platform: ios
  #     profile: production
  #     fingerprint_hash: ${{ needs.fingerprint.outputs.ios_fingerprint_hash }}

  # update_ios_hotfix_if_build:
  #   name: Publish production OTA (iOS hotfix, only if build exists)
  #   needs: [get_ios_build]
  #   if: ${{ needs.get_ios_build.outputs.build_id }}
  #   type: update
  #   environment: production
  #   env:
  #     EXPO_DEBUG: "1"
  #   params:
  #     platform: ios
  #     channel: production
  #     message: "Hotfix PR #${{ github.event.pull_request.number }}"
```

- [ ] **Step 2: Validate the workflow file**

```bash
node C:/Users/olanr/.claude/plugins/cache/expo-plugins/expo/1.0.0/skills/expo-cicd-workflows/scripts/validate.js apps/native/.eas/workflows/production-ota.yml
```

Expected: No validation errors.

- [ ] **Step 3: Commit**

```bash
git add apps/native/.eas/workflows/production-ota.yml
git commit -m "chore(eas): restore production hotfix OTA workflow for apps/native"
```

---

## Summary of Changes from `apps/mobile`

The only differences between the original files and the restored files are path references:

| Original (`apps/mobile`)    | Restored (`apps/native`)    |
| --------------------------- | --------------------------- |
| `apps/mobile/src/**`        | `apps/native/src/**`        |
| `apps/mobile/app.config.ts` | `apps/native/app.config.ts` |
| `apps/mobile/package.json`  | `apps/native/package.json`  |
| `apps/mobile/assets/**`     | `apps/native/assets/**`     |

Everything else — job logic, fingerprint strategy, OTA conditions, iOS commented stubs — is preserved exactly as it was.
