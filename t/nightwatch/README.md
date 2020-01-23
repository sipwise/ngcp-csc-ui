# Nightwatch.js

## Configuration

In root folder there is a nightwatch.conf.js file with config entries.

## Execution

From root folder executes

npm run e2e-test

which run tests in parallel - 2 instances of Chrome (for calls / conferencing)

./node_modules/.bin/nightwatch -e default,default t/nightwatch

By changing default,default to default,firefox, it will execute the tests in Chrome and Geckodriver.

## Issues

1. clearValue() does not work, and had to be workarounded with a function which manually remove value from field
2. In Firefox Keys.BACK_SPACE does not work.
3. Sometimes one of the two browsers freezes, often at login.
4. While testing conference, sometimes the conference cannot be joined. Also the remote participant does not show up. Not sure if it's environment issue or nightwatch related.
