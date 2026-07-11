/** @type {import('lint-staged').Config} */
module.exports = {
  "*": "secretlint",
  "*.{js,jsx,ts,tsx}": ["oxlint", "oxfmt --write"],
  "*.{json,md,yml,yaml}": ["oxfmt --write"],
  "*.md": (filenames) => {
    // Exclude .serena/ memory files from markdown linting
    const toCheck = filenames.filter((f) => !f.includes(".serena/"));
    if (toCheck.length === 0) return [];
    return `markdownlint-cli2 ${toCheck.join(" ")}`;
  },
};
