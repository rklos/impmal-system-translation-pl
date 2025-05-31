import base from '@rklos/eslint-configs/base';

export default [
  ...base,
  {
    languageOptions: {
      globals: {
        Hooks: 'readonly',
        Handlebars: 'readonly',
        game: 'readonly',

        IMPMAL: 'readonly',
        SkillsModel: 'readonly',
      },
    },
  },
  {
    files: [ 'tools/**/*.js' ],
    rules: {
      'no-console': 0,
      'no-underscore-dangle': 0,
      'no-restricted-syntax': 0,
      'guard-for-in': 0,
      'no-continue': 0,
    },
  },
];
