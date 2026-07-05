# Google Stitch - Image to Code

Use this workflow when converting design images to implementation-ready UI code.

## Workflow

### Step 1: Classify Target

- Web/Next.js work → `apps/web`
- Mobile/React Native work → `apps/mobile`
- If unspecified, default to `apps/web`

### Step 2: Generate Baseline

Create structure-preserving baseline code from the image.

### Step 3: Repo Adaptation (Mandatory)

After baseline generation, normalize to this repo:

1. Read in order:
   - `docs/README.md`
   - Root `AGENT.md`
   - Workspace `AGENT.md` (e.g., `apps/web/AGENT.md`)

2. Apply constraints:
   - Strict monorepo boundaries
   - Backend authority
   - Workspace styling conventions
   - Design token usage

### Step 4: Output Requirements

Every image-to-code result should include:

- Baseline source note
- Files changed
- Standards applied (docs + AGENT references)
- Any intentional visual deviations from the image

## Guardrails

- Do not copy visual output that violates architecture or security
- Do not add app-to-app imports
- Keep generated UI within target app workspace
- Prefer existing design tokens over one-off values
