module.exports = {
  extends: 'eslint-config-airbnb',
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8,
  },
  rules: {
    'react/sort-comp': 0,
    'import/extensions': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': [2, {ignore: ['electron']}],
    'linebreak-style': ['error', 'unix'],
    'object-curly-spacing': ['error', 'never'],
    'import/prefer-default-export': 0,
    'react/prefer-stateless-function': 0,
    'arrow-parens': ['error', 'as-needed'],
  },
};
