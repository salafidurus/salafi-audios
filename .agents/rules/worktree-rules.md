# Git Worktree Workflow Rules

Every implementation/task must follow this Git worktree workflow to ensure isolated workspaces and clean project management.

## Naming

- Keep worktree names short: **1-2 words** max (e.g. `f-agent`, `f-agent-update`, `c-deps`, `fix-player`).
- Names must follow the prefix conventions below.

## Guidelines

- **Workspace Isolation**: Every task or feature implementation must be done in a separate git worktree, branched from `origin/main`.
- **Worktree Folder**: Always create the worktree inside the `.worktrees` directory at the project root.
- **Naming Conventions**:
  - **Chore & CI tasks**:
    - Worktree directory: `.worktrees/c-xxx`
    - Git branch: `c/xxx`
  - **Features**:
    - Worktree directory: `.worktrees/f-xxx`
    - Git branch: `f/xxx`
  - **Bug Fixes / Hotfixes**:
    - Worktree directory: `.worktrees/fix-xxx`
    - Git branch: `fix/xxx`

## Post-Creation: Copy .env Files + Install

After creating a worktree, copy all `.env` files from the main working tree into the worktree. These files are gitignored and not shared across worktrees. Then install dependencies.

```bash
# From repo root:
WORKTREE=".worktrees/<worktree-name>"

# Copy .env files (exclude node_modules, .git, .worktrees)
find . -maxdepth 4 -name '.env' \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*.worktrees/*' \
  -exec sh -c 'mkdir -p "$(dirname "$2/$1")" && cp "$1" "$2/$1"' _ {} "$WORKTREE" \;

# Install dependencies
bun install
```

## Pre & Post Work Verification

Run these before starting AND before pushing to confirm no regressions:

```bash
bun run build
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run doctor
```

If pre-work fails, diagnose and fix before beginning. If post-work fails, diagnose and fix before pushing — this ensures new failures are from your changes, not pre-existing issues.

## Post-Work: Push & PR

After post-work verification passes, push the branch matching the naming conventions above (e.g. worktree `.worktrees/f-foo` → branch `f/foo`):

```bash
git push -u origin <branch-name>
gh pr create --title "Short description of change" --body "Sufficient context of what was done and why"
```

## Cleanup & Deletion Workflow

1. **PR Merged**: Confirm the PR has been merged on the remote.
2. **Pull merged code into local main**: After merge confirmation, pull the merged code into local main:
3. **Pull merged code into local main**: After merge confirmation, pull the merged code into local main:
   ```bash
   git checkout main && git pull
   ```
4. **Clean up**: Once merged and pulled locally, delete the local resources:
   ```bash
   git worktree remove .worktrees/<name>
   git branch -d <branch-name>
   ```
