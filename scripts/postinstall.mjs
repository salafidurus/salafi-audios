import { spawnSync } from "node:child_process";

const buildTargets = [
  // Keep postinstall minimal for EAS and local fresh installs.
  // Only build the workspace packages that must exist as install-time
  // prerequisites for downstream package resolution.
  "@sd/design-tokens",
];

for (const target of buildTargets) {
  console.log(`\n> pnpm --filter ${target} build`);

  // `shell: true` is required so the pnpm shim resolves cross-platform
  // (spawning `pnpm.cmd` directly throws EINVAL on Windows). We pass the
  // whole command as a single string rather than an args array to avoid
  // Node's DEP0190 warning — the only interpolated value is a hardcoded
  // build target from the list above, so there is no injection risk.
  const result = spawnSync(`pnpm --filter ${target} build`, {
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
