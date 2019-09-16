module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8,
  },
  extends: ['airbnb', 'prettier', 'prettier/react'],
  plugins: ['import', 'prettier', 'react'],
  rules: {
    'prettier/prettier': 'error',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'global-require': 'off',
  },
  env: {
    browser: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['components', './src/components'], ['store', './src/store']],
        extensions: ['.js', '.jsx', '.json'],
      },
    },
  },
};
