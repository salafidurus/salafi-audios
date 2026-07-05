---
description: Convert an uploaded design image into repo-compliant UI code using a Stitch-first flow.
---

Load the Google Stitch skill and run an image-to-code pipeline that generates baseline UI from the image, then adapts it to repository standards.

## Workflow

### Step 1: Load skills

```
skill({ name: 'google-stitch' })
```

Then load target-specific skills based on request context:

- Web/Next.js: `next-best-practices`, `vercel-react-best-practices`
- Mobile/React Native: `building-native-ui`, `vercel-react-native-skills`

### Step 2: Resolve target workspace and standards

Read these in order:

1. `docs/README.md`
2. `AGENT.md`
3. `apps/web/AGENT.md` or `apps/mobile/AGENT.md` (target-dependent)
4. `.github/copilot-instructions.md`

### Step 3: Generate Stitch baseline

- Use the uploaded image as the source design.
- Create baseline code via Stitch when available.
- If direct Stitch execution is unavailable, create a faithful stitch-style baseline and continue.

### Step 4: Adapt baseline to repository conventions

- Match app structure and dependency direction.
- Use existing styling/token conventions.
- Keep backend contracts and authority boundaries intact.
- Keep components and file names consistent with target workspace.

### Step 5: Deliver implementation notes

Return:

- Baseline mode used: `stitch` or `stitch-fallback`
- Files added/updated
- Standards applied from docs/AGENT/skills
- Follow-up items for refinement (if any)

<user-request>
$ARGUMENTS
</user-request>
