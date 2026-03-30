import ts from '@rklos/eslint-configs/typescript';

export default [
  ...ts,
  {
    rules: {
      // fvtt-types requires `any` casts for game.settings, Roll prototype, etc.
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Foundry VTT uses underscored internals (_total, _evaluateTotal, _updateObject)
      'no-underscore-dangle': 'off',
      // Allow property mutation on function parameters (DOM elements, Roll objects)
      'no-param-reassign': [ 'error', { props: false } ],
    },
  },
  {
    files: ['tools/**', '.vite/**', 'vite.config.js'],
    rules: {
      'no-console': 'off',
      'no-underscore-dangle': 'off',
      'no-restricted-syntax': 'off',
      'guard-for-in': 'off',
      'no-continue': 'off',
      'consistent-return': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
];
