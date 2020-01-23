const testUrl = "http://localhost:8080/";
const username = "43993006";
const password = "x43993006";
const conferenceID = 'e2e-test-conf';
const waitImeout = 10000;

describe('Sipwise CSC - Conferencing', function() {

	test('1. login', function(browser) {
		browser
			.url(testUrl)
			.waitForElementVisible('#csc-login-username', waitImeout)
			.setValue('#csc-login-username  input', username)
			.keys(browser.Keys.TAB)
			.setValue('#csc-login-password  input', password)
			.keys(browser.Keys.ENTER)
			.waitForElementVisible('#main-menu', waitImeout)
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
			.pause(1000)
			.setValue('#csc-conf-link-input input', conferenceID)
			.click('#csc-conference-video-btn')
			.pause(3000)
			.click('#csc-conference-join-btn')
			.assert.urlContains(conferenceID)
	});

	test('4. interact with other participants', function(browser) {
		browser
			.waitForElementVisible('.csc-conf-participant-cont', waitImeout) // self
			//.waitForElementVisible('#csc-conf-remote-participants-cont .csc-conf-participant-cont', waitImeout) // remote
			.assert.visible('.csc-conf-participant-cont')
			//.assert.visible('#csc-conf-remote-participants-cont .csc-conf-participant-cont')
	});

	test('5. leave the conference', function(browser) {
		browser
			.click('#csc-conf-close-btn')
			.waitForElementVisible('#dialog-confirm-btn', waitImeout)
			.click('#dialog-confirm-btn')
			.waitForElementVisible('#csc-conference-join-btn', waitImeout)
			.assert.visible('#csc-conference-join-btn')
			.end()
	});


});
