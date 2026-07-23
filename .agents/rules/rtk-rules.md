# RTK - CLI Token Optimizer

When executing shell commands, always prefix them with the rtk proxy to reduce token usage.

## Usage

Instead of running commands directly:

```bash
git status
bun run test ./...
```

Prefix with `rtk`:

```bash
rtk -- git status
rtk -- bun run test
```

This applies to all shell commands. RTK filters verbose output while preserving errors and essential information.
