/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "@repo/eslint-config/react.js",
    "plugin:@tanstack/eslint-plugin-query/recommended",
  ],
  parserOptions: {
    project: true,
  },
};
