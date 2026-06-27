/** @type {import('lint-staged').Config} */
module.exports = {
  "*": "secretlint",
  "*.{js,jsx,ts,tsx}": ["oxlint", "oxfmt --write"],
  "*.{json,md,yml,yaml}": ["oxfmt --write"],
  "*.md": ["markdownlint-cli2"],
};
