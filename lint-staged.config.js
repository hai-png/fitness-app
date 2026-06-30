/** @type {import('lint-staged').Configuration} */
export default {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,cjs,mjs,json,css,md}": ["prettier --write"],
};
