/** @type {import('lint-staged').Config} */
module.exports = {
  "*.{js,jsx,ts,tsx}": ["oxlint", "prettier -w"],
  "*.{json,md,yml,yaml}": ["prettier -w"],
  "*.md": ["markdownlint-cli2"],
};
