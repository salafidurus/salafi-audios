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

## Pre-Work Verification

Before starting any implementation, verify the worktree has no carried-over issues:

```bash
bun run build
bun run lint
bun run typecheck
bun run test
bun run test:e2e
```

If any of these fail, diagnose and fix before beginning work. This ensures the worktree is clean and any new failures are caused by your changes, not pre-existing issues.

## Cleanup & Deletion Workflow

1. **Push when complete**: When the work is fully complete and verified, push the branch to the remote repository.
2. **Await Merge**: Await verification/confirmation from the user that the branch has been merged (or if you later discover that the branch has been merged on the remote).
3. **Pull merged code into local main**: After merge confirmation, pull the merged code into local main:
   ```bash
   git checkout main && git pull
   ```
4. **Clean up**: Once merged and pulled locally, delete the local resources:
   ```bash
   git worktree remove .worktrees/<name>
   git branch -d <branch-name>
   ```
