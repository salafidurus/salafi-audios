# Snip - CLI Token Optimizer

When executing shell commands, always prefix them with the snip proxy to reduce token usage.

## Usage

Instead of running commands directly:

```bash
git status
go test ./...
```

Prefix with `snip`:

```bash
snip -- git status
```

This applies to all shell commands. Snip filters verbose output while preserving errors and essential information.
