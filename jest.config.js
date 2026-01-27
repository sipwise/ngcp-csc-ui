const esModules = ['quasar/lang', 'lodash-es', 'quasar'].join('|')

module.exports = {
    globals: {
        __DEV__: true
    },
    setupFilesAfterEnv: [
        '<rootDir>/test/jest/jest.setup.js'
    ],
    // noStackTrace: true,
    // bail: true,
    // cache: false,
    // verbose: true,
    // watch: true,
    collectCoverage: true,
    coverageDirectory: '<rootDir>/test/jest/coverage',
    collectCoverageFrom: [
        '<rootDir>/src/**/*.vue',
        '<rootDir>/src/**/*.js',
        '<rootDir>/src/**/*.ts',
        '<rootDir>/src/**/*.jsx'
    ],
    coveragePathIgnorePatterns: ['/node_modules/', '.d.ts$'],
    coverageThreshold: {
        global: {
            //  branches: 50,
            //  functions: 50,
            //  lines: 50,
            //  statements: 50
        }
    },
    testMatch: [
        '<rootDir>/test/jest/__tests__/**/*.spec.js',
        '<rootDir>/test/jest/__tests__/**/*.test.js',
        '<rootDir>/src/**/__tests__/*_jest.spec.js'
    ],
    moduleFileExtensions: [
        'vue',
        'js',
        'json'
    ],
    moduleNameMapper: {
        '^vue$': 'vue',
        '^test-utils$': '@vue/test-utils',
        // '^quasar$': '<rootDir>/node_modules/quasar/dist/quasar.common.js',
        '^~/(.*)$': '<rootDir>/$1',
        '^src/(.*)$': '<rootDir>/src/$1',
        '^components/(.*)$': '<rootDir>/src/components/$1',
        '.*css$': '<rootDir>/test/jest/utils/stub.css'
    },
    transform: {
        '.*\\.vue$': '<rootDir>/node_modules/@vue/vue3-jest',
        '.*\\.js$': '<rootDir>/node_modules/babel-jest',
        '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub'
        // use these if NPM is being flaky
        // '.*\\.vue$': '<rootDir>/node_modules/@quasar/quasar-app-extension-testing-unit-jest/node_modules/vue-jest',
        // '.*\\.js$': '<rootDir>/node_modules/@quasar/quasar-app-extension-testing-unit-jest/node_modules/babel-jest'
    },
    transformIgnorePatterns: [`node_modules/(?!(${esModules}))`],
    snapshotSerializers: [
        '<rootDir>/node_modules/jest-serializer-vue'
    ],
    reporters: ['default', 'jest-junit']
}
