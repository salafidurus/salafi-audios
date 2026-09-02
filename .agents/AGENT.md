# `.agents/` guidance

`.agents/` is the canonical home for shared agent rules and skills.

- Author skills only in `.agents/skills/<skill-name>/`.
- Keep always-on rules in `.agents/rules/`.
- Do not create implementation plans here; track work in GitHub Issues and PRs.
- Run `bun run --filter @sd/scripts sync-agents` after changing this directory. It repairs
  tool-specific aliases; never edit those aliases directly.
