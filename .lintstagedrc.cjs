/** @type {import('lint-staged').Config} */
module.exports = {
  "*.{js,jsx,ts,tsx,json,md,yml,yaml}": [
    "prettier -w"
  ]
};
