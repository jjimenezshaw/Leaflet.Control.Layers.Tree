import eslintJS from '@eslint/js';
import eslintPluginHtml from 'eslint-plugin-html';
import globals from 'globals';

export default [
    {ignores: ['**/dist**']},
    eslintJS.configs.recommended,
    {
        files: ['test/**'],
        languageOptions: {
            globals: {
                ...globals.mocha,
                ...globals.jest,
                chai: true,
                happen: true,
                MOVE_OVER_TYPE: true,
                MOVE_OUT_TYPE: true,
            },
        },
    },
    {
        files: ['**/*.js', '**/*.mjs', '**/*.html'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.es6,
                L: true,
            },
        },
        plugins: {
            html: eslintPluginHtml,
        },
        settings: {
            'html/indent': 'space',
            'html/report-bad-indent': 2,
        },
        rules: {
            camelcase: 'error',
            'comma-spacing': ['error', {after: true}],
            'comma-style': 'error',
            indent: ['error', 4],
            'key-spacing': 'error',
            'keyword-spacing': 'error',
            'no-console': 'error',
            'no-constant-condition': 'off',
            'no-lonely-if': 'error',
            'no-multi-spaces': 'error',
            'no-shadow': 'off',
            'no-trailing-spaces': 'error',
            'no-underscore-dangle': 'off',
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'object-curly-spacing': 'error',
            quotes: ['error', 'single', 'avoid-escape'],
            'space-before-blocks': 'error',
            'space-before-function-paren': ['error', 'never'],
            'space-in-parens': 'error',
            semi: ['error', 'always'],
            strict: 'off',
        },
    },
];
