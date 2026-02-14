const fs = require("fs/promises");
const path = require("path");

async function main() {
  const pkgRoot = path.join(__dirname, "..");
  const outFile = path.join(pkgRoot, "generated", "schemas.ts");

  // Turbopack/ESM can be picky about directory imports. Orval's generated
  // endpoints import `./schemas`, so we create a file at that path.
  const contents = [
    "/**",
    " * Generated helper (repo-owned).",
    " * Do not edit manually.",
    " */",
    "",
    'export * from "./schemas/index";',
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, contents, "utf8");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
