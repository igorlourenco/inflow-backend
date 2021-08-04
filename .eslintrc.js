module.exports = {
  extends: 'imbudhiraja',
  parser: '@babel/eslint-parser',
  parserOptions: { requireConfigFile: false },
  rules: {
    'filenames/match-exported': [2, 'kebab'],
    'linebreak-style': 'off',
    'max-classes-per-file': ['error', 2],
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'sort-keys': 'off',
  },
};
