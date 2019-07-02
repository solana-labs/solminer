module.exports = {
  extends: 'eslint-config-airbnb',
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8,
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'import/extensions': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': [2, {ignore: ['electron']}],
    'import/prefer-default-export': 0,
    'linebreak-style': ['error', 'unix'],
    'no-console': 0,
    'object-curly-spacing': ['error', 'never'],
    'react/prefer-stateless-function': 0,
    'react/sort-comp': 0,
  },
};
