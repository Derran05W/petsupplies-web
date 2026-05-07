/** @type {import('lint-staged').Configuration} */
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{js,mjs,cjs,json,md,css}': ['prettier --write'],
};
