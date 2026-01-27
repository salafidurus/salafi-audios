/** @type {import('lint-staged').Config} */
module.exports = {
  "*.{js,jsx,ts,tsx}": [
    "prettier -w"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier -w"
  ]
};
