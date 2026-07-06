const buildTargets = [
  // Keep postinstall minimal for EAS and local fresh installs.
  // Only build the workspace packages that must exist as install-time
  // prerequisites for downstream package resolution.
  "@sd/design-tokens",
];

for (const target of buildTargets) {
  console.log(`\n> bun run --filter ${target} build`);

  // Run using Bun.spawnSync natively without requiring node:child_process.
  const result = Bun.spawnSync(["bun", "run", "--filter", target, "build"], {
    stdio: ["inherit", "inherit", "inherit"],
  });

  if (result.exitCode !== 0) {
    process.exit(result.exitCode ?? 1);
  }
}
