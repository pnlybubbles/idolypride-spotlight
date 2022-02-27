/** @type { import('eslint').Linter.Config } */
module.exports = {
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: ['./tsconfig.json'],
  },
  extends: ['plugin:vue/vue3-recommended', '@vue/eslint-config-typescript/recommended', '@vue/eslint-config-prettier'],
  rules: {
    // Equivalent to `recommended-requiring-type-checking`
    // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/recommended-requiring-type-checking.ts
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-for-in-array': 'error',
    'no-implied-eval': 'off',
    '@typescript-eslint/no-implied-eval': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    'require-await': 'off',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/restrict-plus-operands': 'error',
    '@typescript-eslint/restrict-template-expressions': 'error',
    '@typescript-eslint/unbound-method': 'error',
    // User override
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    'vue/multi-word-component-names': 'off',
    'vue/component-name-in-template-casing': 'error',
  },
}
