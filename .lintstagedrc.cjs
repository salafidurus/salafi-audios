/** @type {import('lint-staged').Config} */
module.exports = {
  "*": "secretlint",
  "{apps,infra,packages,scripts}/**/*.{js,jsx,ts,tsx}": ["oxlint --fix", "oxfmt --write"],
  "tools/**/*.{js,jsx,ts,tsx}": "oxfmt --write",
  "*.{json,md,yml,yaml}": ["oxfmt --write"],
  "*.md": "markdownlint-cli2",
};
