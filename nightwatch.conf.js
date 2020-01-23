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
				"acceptInsecureCerts": true
			},
			"globals": {
				"waitForConditionTimeout": 5000,
				"retryAssertionTimeout": 20000
			}
		},
		"firefox": {
			"desiredCapabilities": {
				"browserName": "firefox",
				"acceptInsecureCerts": true
			},

			"webdriver": {
				"start_process": true,
				"port": 4444,
				"server_path": require("geckodriver").path
			}
		}
	}
}
