module.exports = {
	"src_folders": ["t/nightwatch"],
	"output_folder": "t/nightwatch/tests_output",

	"webdriver": {
		"start_process": true,
		"server_path": "node_modules/.bin/chromedriver",
		"port": 9515,
		"log_path": false
	},

	"test_settings": {
		"default": {
			"launch_url": "http://localhost:8080",
			"desiredCapabilities": {
				"browserName": "chrome",
				"acceptInsecureCerts": true,
				"chromeOptions": {
					"args": [
						'use-fake-device-for-media-stream',
						'use-fake-ui-for-media-stream'
					]
				}
			},
			"globals": {
				"waitForConditionTimeout": 10000
				// "retryAssertionTimeout": 10000
			}
		},
		"firefox": {
			"desiredCapabilities": {
				"browserName": "firefox",
				"alwaysMatch": {
					"acceptInsecureCerts": true,
					"moz:firefoxOptions": {
						"args": [
							'-allow-insecure-localhost'
						],
						"prefs": {
							'media.navigator.streams.fake': true
						}
					}
				}
			},

			"webdriver": {
				"start_process": true,
				"port": 4444,
				"server_path": require('geckodriver').path
			}
		}
	}
}
