const testUrl = "http://localhost:8080/";
const username = "43993006";
const password = "x43993006";
const conferenceID = 'e2e-test-conf';

describe('Sipwise CSC - Conferencing', function() {

	test('1. login', function(browser) {
		browser
			.url(testUrl)
			.waitForElementVisible('#csc-login-username')
			.setValue('#csc-login-username  input', username)
			.keys(browser.Keys.TAB)
			.setValue('#csc-login-password  input', password)
			.keys(browser.Keys.TAB)
			.click('#csc-login-submit-btn')
			.assert.urlContains('user/home');
	});

	test('2. open conference module', function(browser) {
		browser
			.click('#csc-main-menu-conference')
			.assert.urlContains('conference')
	});

	test('3. join the conference', function(browser) {
		browser
			// workaround for chrome due to buggy clearValue()
			// https://github.com/nightwatchjs/nightwatch/issues/1939
			.click('#csc-conf-link-input input')
			.getValue('#csc-conf-link-input input', function(result) {
				const length = result.value.length;
				for (let i = 0; i < length; i++) {
					browser.keys(browser.Keys.BACK_SPACE);
				}
			})
			//
			.clearValue('#csc-conf-link-input input')
			.pause(1000)
			.setValue('#csc-conf-link-input input', conferenceID)
			.click('#csc-conference-video-btn')
			.pause(5000)
			.click('#csc-conference-join-btn')
			.assert.urlContains(conferenceID)
	});

	test('4. interact with other participants', function(browser) {
		browser
			.waitForElementVisible('#csc-conf-participants-cont')
			.waitForElementVisible('#csc-conf-remote-participants-cont .csc-conf-participant-cont')
	});

	test('5. leave the conference', function(browser) {
		// click on conf close
		// confirm
		// check if join button is visible
		browser
			.end()
	});


});
