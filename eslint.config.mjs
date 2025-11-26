import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import jest from 'eslint-plugin-jest'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import unusedImports from 'eslint-plugin-unused-imports'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'

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

    // legacy configs: "standard" converted to flat config
    ...compat.extends('standard'),

    {
        ...vue.configs['vue3-recommended']
    },

    {
        plugins: {
            vue,
            jest,
            'unused-imports': unusedImports,
            'no-relative-import-paths': noRelativeImportPaths,
            import: importPlugin,
            stylistic
        },
        files: ['**/*.vue', '**/*.js', '**/*.ts', '**/*.mjs'],
        ignores: ['src/store/store-flag.d.ts'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: '@babel/eslint-parser', // JS inside <script>
                ecmaVersion: 'latest',
                sourceType: 'module',
                requireConfigFile: false,
                extraFileExtensions: ['.vue']
            },
            globals: {
                ...globals.browser,
                ...jest.environments.globals.globals,
                ga: true,
                cordova: true,
                __statics: true,
                process: true,
                console: true,
                Capacitor: true,
                chrome: true,
                jest: true
            }
        },
        rules: {
            // JS styling (indent, spaces, etc.)
            'stylistic/arrow-parens': 'error',
            'stylistic/arrow-spacing': 'error',
            'stylistic/brace-style': 'error',
            'stylistic/newline-per-chained-call': 'off',
            'stylistic/nonblock-statement-body-position': ['error', 'below'],
            'stylistic/object-curly-newline': [
                'error',
                {
                    ImportDeclaration: { multiline: true, minProperties: 4 }
                }
            ],
            'stylistic/object-curly-spacing': ['error', 'always'],

            // turn off base rules duplicated by stylistic
            'arrow-spacing': 'off',
            'brace-style': 'off',
            indent: 'off',
            'object-curly-newline': 'off',
            'object-curly-spacing': 'off',

            // usual JS best practices
            'default-param-last': 'error',
            'no-trailing-spaces': 'error',
            'stylistic/no-trailing-spaces': 'error',
            eqeqeq: ['error', 'always'],
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
            'object-shorthand': 'error',
            'prefer-const': 'error',
            'prefer-object-spread': 'error',
            'prefer-template': 'error',
            'unused-imports/no-unused-imports': 'error',

            // Vue SFC style (indentation inside <template>)
            'vue/html-indent': ['error', 4]
        }
    }
]
