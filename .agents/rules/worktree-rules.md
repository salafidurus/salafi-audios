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

## Cleanup & Deletion Workflow

1. **Push when complete**: When the work is fully complete and verified, push the branch to the remote repository.
2. **Await Merge**: Await verification/confirmation from the user that the branch has been merged (or if you later discover that the branch has been merged on the remote).
3. **Clean up**: Once merged, delete the local resources by executing:
   - `git worktree remove .worktrees/<name>` to remove the worktree directory.
   - `git branch -d <branch-name>` to delete the branch locally.
