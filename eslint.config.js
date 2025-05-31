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
];
