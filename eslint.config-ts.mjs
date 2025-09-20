import eslintJS from '@eslint/js';
import parser from '@typescript-eslint/parser';
import globals from 'globals';
import eslintTS from 'typescript-eslint';

export default [
    {ignores: ['**/dist**']},
    eslintJS.configs.recommended,
    ...eslintTS.configs.recommended,
    eslintTS.configs.eslintRecommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es6
            },
            parser
        },
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off'
        }
    }
];
