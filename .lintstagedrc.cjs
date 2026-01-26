/** @type {import('lint-staged').Config} */
module.exports = {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier -w",
    "tsc --noEmit"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier -w"
  ]
};
