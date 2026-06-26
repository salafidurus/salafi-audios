import { spawnSync } from "node:child_process";

const buildTargets = [
  // Keep postinstall minimal for EAS and local fresh installs.
  // Only build the workspace packages that must exist as install-time
  // prerequisites for downstream package resolution.
  "@sd/design-tokens",
];

const cmd = "bun";

for (const target of buildTargets) {
  console.log(`\n> bun run --filter ${target} build`);

  // Run without shell: true to avoid shell-spawn vulnerabilities.
  const args = ["run", "--filter", target, "build"];
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
