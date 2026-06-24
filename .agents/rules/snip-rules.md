# Snip - CLI Token Optimizer

When executing shell commands, always prefix them with the snip proxy to reduce token usage.

## Usage

Instead of running commands directly:

```bash
git status
go test ./...
```

Prefix with `snip` (either directly or using its absolute path):

```bash
snip -- git status
# Or using the absolute path:
C:/Users/olanr/go/bin/snip.exe -- git status
```

This applies to all shell commands. Snip filters verbose output while preserving errors and essential information.
