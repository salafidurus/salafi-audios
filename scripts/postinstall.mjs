const buildTargets = [
  // Keep postinstall minimal for EAS and local fresh installs.
  // Only build the workspace packages that must exist as install-time
  // prerequisites for downstream package resolution.
  "@sd/design-tokens",
];

for (const target of buildTargets) {
  console.log(`\n> bun run --filter ${target} build`);

  // Run using Bun Shell natively. Throws automatically on failure.
  await Bun.$`bun run --filter ${target} build`;
}
