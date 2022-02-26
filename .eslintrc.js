/** @type { import('eslint').Linter.Config } */
module.exports = {
  extends: ['plugin:vue/vue3-recommended', '@vue/eslint-config-typescript/recommended', '@vue/eslint-config-prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'vue/multi-word-component-names': 'off',
  },
}
