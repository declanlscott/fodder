/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ["@repo/eslintrc/index.js", "plugin:react-hooks/recommended"],
};
