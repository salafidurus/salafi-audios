import { spawnSync } from "node:child_process";

const buildTargets = [
  // Keep postinstall minimal for EAS and local fresh installs.
  // Only build the workspace packages that must exist as install-time
  // prerequisites for downstream package resolution.
  "@sd/design-tokens",
];

const cmd = process.platform === "win32" ? "cmd.exe" : "pnpm";
const baseArgs = process.platform === "win32" ? ["/c", "pnpm"] : [];

for (const target of buildTargets) {
  console.log(`\n> pnpm --filter ${target} build`);

  // Run without shell: true to avoid shell-spawn vulnerabilities.
  // Resolve cross-platform pnpm command shim name natively.
  const args = [...baseArgs, "--filter", target, "build"];
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
