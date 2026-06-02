// Enforces Conventional Commits (feat:/fix:/chore: etc.) for structured changelogs and clear git history.
// .cjs extension required — commitlint's config loader expects CommonJS regardless of project module type.
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
