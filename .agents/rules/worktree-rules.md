# Git Worktree Workflow Rules

Every implementation/task must follow this Git worktree workflow to ensure isolated workspaces and clean project management.

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

## Post-Creation: Copy .env Files

After creating a worktree, copy all `.env` files from the main working tree into the worktree.
These files are gitignored and not shared across worktrees.

```bash
# From repo root:
$src = Get-Item .; $dst = "C:\dev\salafi-audios\.worktrees\<worktree-name>"
Get-ChildItem -Path $src -Filter ".env" -Recurse -Depth 4 |
  Where-Object { -not $_.FullName.Contains("node_modules") -and -not $_.FullName.Contains(".git") -and -not $_.FullName.Contains(".worktrees") } |
  ForEach-Object {
    $rel = $_.FullName.Substring($src.FullName.Length + 1)
    $target = Join-Path $dst $rel
    New-Item -ItemType File -Path $target -Force | Out-Null
    Copy-Item -Path $_.FullName -Destination $target -Force
  }
```

## Cleanup & Deletion Workflow

1. **Push when complete**: When the work is fully complete and verified, push the branch to the remote repository.
2. **Await Merge**: Await verification/confirmation from the user that the branch has been merged (or if you later discover that the branch has been merged on the remote).
3. **Clean up**: Once merged, delete the local resources by executing:
   - `git worktree remove .worktrees/<name>` to remove the worktree directory.
   - `git branch -d <branch-name>` to delete the branch locally.
