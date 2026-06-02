---
name: google-stitch
description: |
  Google Stitch workflow for turning uploaded design images into implementation-ready UI code,
  then adapting the result to this repository's documented standards. Triggers on: image-based
  UI requests, screenshot-to-code, Figma screenshot conversion, design mockups, landing page
  recreation, and "use Stitch" requests.
metadata:
  version: 0.1.0
---

# Google Stitch Skill

Use this skill when the user provides or references a design image and expects generated UI code.

## Goal

1. Generate a baseline implementation from the image with Google Stitch.
2. Adapt that output to repository standards in docs and AGENT files.
3. Deliver code that matches architecture, styling, and quality guardrails.

## Required Workflow

### Step 1: Classify target surface

Infer target first:

- Web/Next.js work -> `apps/web`
- Mobile/React Native work -> `apps/mobile`
- If unspecified, default to `apps/web`

### Step 2: Stitch-first generation

When image input is present, create baseline code using Stitch before local adaptation.

- If a Stitch connector or API is configured in the runtime, use it.
- If direct Stitch execution is unavailable in the current runtime, produce a structure-preserving
  "stitch-style baseline" from the image and continue adaptation without blocking.

### Step 3: Repo adaptation pass (mandatory)

After baseline generation, normalize to this repo:

- Read order: `docs/README.md` -> root `AGENT.md` -> workspace `AGENT.md` -> `.github/copilot-instructions.md`
- Keep strict monorepo boundaries and architecture rules.
- Preserve backend authority and API contract constraints.
- Apply workspace styling and component conventions.

### Step 4: Skill stacking

Load additional skills based on target:

- Web: `next-best-practices`, `vercel-react-best-practices`
- Mobile: `building-native-ui`, `vercel-react-native-skills`

### Step 5: Output requirements

Every image-to-code result should include:

- Baseline source note: `stitch` or `stitch-fallback`
- Files changed
- Standards applied (docs + AGENT references)
- Any intentional visual deviations from the image

## Guardrails

- Do not copy visual output blindly if it violates documented architecture or security constraints.
- Do not add app-to-app imports.
- Keep generated UI code within the target app workspace.
- Prefer existing design tokens and primitives over one-off values.
