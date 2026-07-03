const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

const tsEslintRecommended =
  tsPlugin.configs['eslint-recommended'].overrides[0].rules;

const sharedRules = {
  ...js.configs.recommended.rules,
  ...tsEslintRecommended,
  ...tsPlugin.configs.recommended.rules,
  ...tsPlugin.configs['recommended-type-checked'].rules,
  ...prettierConfig.rules,
  'no-console': 'error',
  'prettier/prettier': [
    'error',
    {
      endOfLine: 'auto',
    },
  ],
  '@typescript-eslint/explicit-function-return-type': 'error',
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-invalid-void-type': 'error',
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/no-unused-expressions': 'off',
  '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
  '@typescript-eslint/only-throw-error': 'off',
  '@typescript-eslint/prefer-ts-expect-error': 'error',
  '@typescript-eslint/prefer-promise-reject-errors': 'off',
  '@typescript-eslint/typedef': 'error',
  '@typescript-eslint/unified-signatures': 'error',
  'no-unused-expressions': 'off',
  'no-useless-assignment': 'off',
  'preserve-caught-error': 'off',
};

const tsConfig = (files, tsconfigRootDir) => ({
  files,
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir,
    },
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
    prettier: prettierPlugin,
  },
  rules: sharedRules,
});

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'app/node_modules/**',
      'app/lib/**',
      'app/dist/**',
      'lib/**',
      'shared/lib/**',
      'built-tests/**',
      'coverage/**',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  tsConfig(['src/**/*.ts'], `${__dirname}/src`),
  tsConfig(['shared/src/**/*.ts'], `${__dirname}/shared`),
  tsConfig(['app/src/**/*.ts'], `${__dirname}/app`),
];
