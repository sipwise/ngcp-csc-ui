module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    env: {
        browser: true,
        es6: true
    },
    extends: [
        'eslint:recommended'
    ],
    plugins: [
        'html',
        'import'
    ],
    globals: {
        'cdk': true,
        'cordova': true,
        'DEV': true,
        'PROD': true,
        '__THEME': true
    },
    rules: {
        'arrow-parens': 0,
        'one-var': 0,
        'import/first': 0,
        'import/named': 2,
        'import/namespace': 2,
        'import/default': 2,
        'import/export': 2,
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'brace-style': [2, 'stroustrup', {'allowSingleLine': true}],
        "no-console": 0
    }
};

