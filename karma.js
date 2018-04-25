'use strict';

var _ = require('lodash');
var webpackCsc = require('./build/webpack.base.conf');

webpackCsc.module.rules.shift();

module.exports = function(config) {
    config.set({
        basePath: '',
        files: [
            './t/**/*.js'
        ],
        frameworks: ['mocha'],
        plugins : [
            'karma-mocha',
            'karma-webpack',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-junit-reporter',
        ],
        browsers: ['ChromeWebRTC', 'FirefoxWebRTC'],
        customLaunchers: {
            ChromeWebRTC: {
                base: 'Chrome',
                flags: [
                    '--disable-web-security',
                    '--use-fake-device-for-media-stream',
                    '--use-fake-ui-for-media-stream',
                    '--ignore-certificate-errors',
                    '--no-sandbox',
                    '--disable-gpu'
                ]
            },
            FirefoxWebRTC: {
                base: 'Firefox',
                prefs: {
                    'media.navigator.permission.disabled': true,
                    'media.navigator.streams.fake': true
                }
            }
        },
        reporters: [
            'progress',
            'junit'
        ],
        junitReporter: {
            outputDir: './t/'
        },
        preprocessors: {
            './src/**/*.js': ['webpack'],
            './t/**/*.js': ['webpack']
        },
        webpack: {
            module: webpackCsc.module,
            plugins: webpackCsc.plugins
        }
    });
};
