# Agent Delegation — When and How to Dispatch Work

Three delegation layers are available. Pick the lightest one that holds.

## Decision tree

```
Task fits in context, ≤3 files?                → Work inline
Code just written, needs review?               → ponytail-review (ponytail-rules.md)
Task is complex / multi-file / fills context?  ↓
  Fully autonomous end-to-end?                 → /lfg  (compound-engineering)
  Have a plan file to execute?                 → /ce-work
  Need a plan first?                           → /ce-plan → /ce-work
  Multiple independent subtasks, no plan?      → /team or autopilot
  Long-running, needs persistence/retry?       → ralph
  Bounded, self-contained, background-safe?    → agy
```

---

## Compound-Engineering skills (via Skill tool)

| Skill                                 | When                                                 |
| ------------------------------------- | ---------------------------------------------------- |
| `compound-engineering:ce-brainstorm`  | Clarify WHAT before planning HOW                     |
| `compound-engineering:ce-plan`        | Design implementation; produces a durable plan file  |
| `compound-engineering:ce-work`        | Execute a plan file with per-unit commits            |
| `compound-engineering:lfg`            | Fully autonomous: plan → code → review → PR → CI fix |
| `compound-engineering:ce-compound`    | Document a solved problem while context is fresh     |
| `compound-engineering:ce-code-review` | Code review with structured findings                 |

---

## OMC skills (via Skill tool or slash command)

| Skill / Command              | When                                                                       |
| ---------------------------- | -------------------------------------------------------------------------- |
| `oh-my-claudecode:autopilot` | Autonomous multi-step work without manual stage gates                      |
| `oh-my-claudecode:ultrawork` | Deep, thorough implementation — pulls in all OMC capabilities              |
| `oh-my-claudecode:ralph`     | Long task needing retry, persistence, and architect verification on finish |
| `oh-my-claudecode:team`      | Parallel coordinated work (see below)                                      |
| `oh-my-claudecode:plan`      | Strategic planning with deep interview before implementation               |

### Team invocation

```
/team N:agent-type "task description"
/team 3:executor "refactor the auth module"
/team ralph "task"    ← ralph persistence wraps the team pipeline
```

- Max agents: 3 (`~/.claude/.omc-config.json → maxAgents`)
- Pipeline auto-runs: plan → prd → exec → verify → fix
- Worker type is the only thing you choose; other stages auto-route

---

## Superpowers: Subagent-Driven Development

For executing a plan's independent tasks in-session with per-task quality gates (implement → spec review → code-quality review → next task). Invoke via Skill tool: `superpowers:subagent-driven-development`.

---

## agy — Fire-and-Forget CLI Agent

```
# One-shot (blocks until done, prints result)
C:/Users/olanr/AppData/Local/agy/bin/agy.exe -p "Fix TS error in apps/api/src/modules/auth/auth.service.ts"

# Background — use Bash tool with run_in_background: true
C:/Users/olanr/AppData/Local/agy/bin/agy.exe -p "Run pnpm test and report failures" --dangerously-skip-permissions

# Continue most recent agy session
C:/Users/olanr/AppData/Local/agy/bin/agy.exe -c

# With explicit model
C:/Users/olanr/AppData/Local/agy/bin/agy.exe -p "task" --model sonnet
```

**Always set `run_in_background: true`** in the Bash tool when dispatching agy so the main session stays responsive.
