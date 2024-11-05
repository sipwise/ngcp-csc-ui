import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin-js'
import importPlugin from 'eslint-plugin-import'
import jest from 'eslint-plugin-jest'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import unusedImports from 'eslint-plugin-unused-imports'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
})

export default [
    {
        ignores: [
            'debian',
            'src-bex/www',
            'src-capacitor',
            'src-cordova',
            'node_modules',
            'dist',
            '**/.*'
        ]
    },
    ...compat.extends(
        'standard',
        'plugin:vue/recommended'
    ),
    {
        plugins: {
            vue,
            jest,
            'unused-imports': unusedImports,
            'no-relative-import-paths': noRelativeImportPaths,
            import: importPlugin,
            '@stylistic/js': stylisticJs
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...jest.environments.globals.globals,
                ga: true,
                cordova: true,
                __statics: true,
                process: true,
                Capacitor: true,
                chrome: true,
                jest: true
            },
            sourceType: 'module',
            parserOptions: {
                parser: '@babel/eslint-parser'
            }
        },
        rules: {
            '@stylistic/js/arrow-parens': 'error',
            '@stylistic/js/arrow-spacing': 'error',
            '@stylistic/js/brace-style': 'error',
            '@stylistic/js/indent': ['error', 4],
            '@stylistic/js/newline-per-chained-call': 'off',
            '@stylistic/js/nonblock-statement-body-position': ['error', 'below'],
            '@stylistic/js/object-curly-newline': [
                'error',
                {
                    ImportDeclaration: { multiline: true, minProperties: 4 }
                }
            ],
            '@stylistic/js/object-curly-spacing': ['error', 'always'],
            'arrow-spacing': 'off',
            'brace-style': 'off',
            'default-param-last': 'error',
            eqeqeq: ['error', 'always'],
            indent: 'off',
            'import/default': 'error',
            'import/extensions': 'error',
            'import/first': 'off',
            'import/named': 'error',
            'import/namespace': 'error',
            'import/no-extraneous-dependencies': 'off',
            'import/no-unresolved': 'off',
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'sibling',
                        'parent',
                        'index'
                    ],
                    named: true,
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: false,
                        orderImportKind: 'asc'
                    }
                }
            ],
            'import/prefer-default-export': [0],
            'multiline-ternary': 'off',
            'no-console': 'error',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
            'no-duplicate-imports': 'error',
            'no-else-return': ['error', { allowElseIf: true }],
            'no-multi-assign': 'error',
            'no-nested-ternary': 'error',
            'no-param-reassign': 'error',
            'no-relative-import-paths/no-relative-import-paths': ['error'],
            'no-var': 'error',
            'object-curly-newline': 'off',
            'object-curly-spacing': 'off',
            'object-shorthand': 'error',
            'prefer-const': 'error',
            'prefer-object-spread': 'error',
            'prefer-template': 'error',
            'unused-imports/no-unused-imports': 'error',
            'vue/html-indent': ['error', 4]
        }
    }]
