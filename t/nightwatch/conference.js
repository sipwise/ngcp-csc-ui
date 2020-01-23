describe('Sipwise CSC - Conferencing', function() {

	test('1. login', function(browser) {
		browser
			.url('http://localhost:8080/')
			.setValue('#csc-login-username  input', '43993006')
			.setValue('#csc-login-password  input', 'x43993006')
			.click('#csc-login-submit-btn')
			.assert.urlContains('user/home');
	});

	test('2. open conference module', function(browser) {
	});

	test('3. join the conference', function(browser) {
	});

	test('4. interact with other participants', function(browser) {
		// peer connection stats
		// - dom-check if self participant is there
		// - dom-check if remote participant is there
		// - video element running
	});

	test('5. leave the conference', function(browser) {
		browser
			.end();
	});


});
