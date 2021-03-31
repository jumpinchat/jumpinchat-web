module.exports = {
  extends: 'airbnb',
  parser: 'babel-eslint',
  env: {
    node: true,
    es6: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: 2017
  },
  rules: {
    // formatting
    indent: ['error', 2, {'SwitchCase': 1}],
    'no-underscore-dangle': 0,
    strict: 0,
    'linebreak-style': 0,
    'no-bitwise': ['error', { 'int32Hint': true }],

    // import rules
    'import/no-extraneous-dependencies': ['error', {'devDependencies': true}],

    // react rules
    'react/forbid-prop-types': 0,
    'react/prefer-es6-class': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-one-expression-per-line': 0,
    'jsx-a11y/media-has-caption': 0
  },
  overrides: [
    {
      files: ['**/*.spec.js'],
      env: {
        node: true,
        mocha: true,
        jest: true,
      },
    }
  ]
};
