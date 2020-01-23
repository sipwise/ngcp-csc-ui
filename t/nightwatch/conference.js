describe('Sipwise CSC - Conferencing', function() {

	test('1. login', function(browser) {
		browser
			.url('http://localhost:8080/')
			.setValue('input[type=text]', 'test')
			.setValue('input[type=password]', 'test')
			.click('button')
			.pause(4000);
			//.assert.containsText('.mainline-results', 'Nightwatch.js')
	});

	test('2. open conference module', function(browser) {

	});

	test('3. join the conference', function(browser) {

	});

	test('4. interact with other participants', function(browser) {

	});

	test('5. leave the conference', function(browser) {
		browser
			.end();
	});


});
