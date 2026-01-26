/** @type {import('lint-staged').Config} */
module.exports = {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier -w"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier -w"
  ]
};
