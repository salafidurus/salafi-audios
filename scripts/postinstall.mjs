import { spawnSync } from "node:child_process";

const buildTargets = [
  // Keep postinstall minimal for EAS and local fresh installs.
  // Only build the workspace packages that must exist as install-time
  // prerequisites for downstream package resolution.
  "@sd/core-env",
  "@sd/core-contracts",
  "@sd/design-tokens",
];

for (const target of buildTargets) {
  console.log(`\n> pnpm --filter ${target} build`);

  const result = spawnSync("pnpm", ["--filter", target, "build"], {
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
