'use strict'

import Vue from 'vue'
import VueResource from 'vue-resource'
import {
	enableIncomingCallBlocking,
	disableIncomingCallBlocking,
	getIncomingCallBlocking,
	addNumberToIncomingList,
	editNumberFromIncomingList,
	removeNumberFromIncomingList,
	enableOutgoingCallBlocking,
	disableOutgoingCallBlocking,
	getOutgoingCallBlocking,
	addNumberToOutgoingList,
	editNumberFromOutgoingList,
	removeNumberFromOutgoingList
} from '../../src/api/call-blocking'
import { assert } from 'chai'

Vue.use(VueResource)

describe('CallBlocking', function () {
	var subscriberId = 123

	beforeEach(function () {
		Vue.http.interceptors = []
	})

	describe('Incoming', function () {
		it('should enable call blocking for incoming calls', function (done) {
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				assert.equal(request.body[0].op, 'replace')
				assert.equal(request.body[0].path, '/block_in_mode')
				assert.equal(request.body[0].value, true)
				next(request.respondWith('', {
					status: 204
				}))
			})
			enableIncomingCallBlocking(subscriberId).then(() => {
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should disable call blocking for incoming calls', function (done) {
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				assert.equal(request.body[0].op, 'replace')
				assert.equal(request.body[0].path, '/block_in_mode')
				assert.equal(request.body[0].value, false)
				next(request.respondWith('', {
					status: 204
				}))
			})
			disableIncomingCallBlocking(subscriberId).then(() => {
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should get all data regarding incoming call blocking', function (done) {
			var list = [
				'0123456789',
				'0987654321'
			]
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				next(request.respondWith(JSON.stringify({
					block_in_list: list,
					block_in_mode: true
				}), {
					status: 200
				}))
			})
			getIncomingCallBlocking(subscriberId).then((result) => {
				assert.deepEqual(result.list, list)
				assert.equal(result.enabled, true)
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should add a new number to incoming call blocking list', function (done) {
			var number = '0987654321'
			var list = [
				'0123456789'
			]
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				if (request.method === 'GET') {
					next(request.respondWith(JSON.stringify({
						block_in_list: list
					}), {
						status: 200
					}))
				} else if (request.method === 'PUT') {
					assert.deepEqual(request.body.block_in_list, [].concat([number], list))
					next(request.respondWith('', {
						status: 200
					}))
				}
			})
			addNumberToIncomingList(subscriberId, number).then((result) => {
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should edit a number from incoming call blocking list', function (done) {
			var number = '0987654321'
			var list = [
				'0123456789'
			]
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				if (request.method === 'GET') {
					next(request.respondWith(JSON.stringify({
						block_in_list: list
					}), {
						status: 200
					}))
				} else if (request.method === 'PUT') {
					assert.deepEqual(request.body.block_in_list, [number])
					next(request.respondWith('', {
						status: 200
					}))
				}
			})
			editNumberFromIncomingList(subscriberId, 0, number).then((result) => {
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should remove a number from incoming call blocking list', function (done) {
			var number = '0987654321'
			var list = [
				'0123456789'
			]
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				if (request.method === 'GET') {
					next(request.respondWith(JSON.stringify({
						block_in_list: [].concat([number]).concat(list)
					}), {
						status: 200
					}))
				} else if (request.method === 'PUT') {
					assert.deepEqual(request.body.block_in_list, list)
					next(request.respondWith('', {
						status: 200
					}))
				}
			})
			removeNumberFromIncomingList(subscriberId, 0, number).then((result) => {
				done()
			}).catch((err) => {
				done(err)
			})
		})
	})

	describe('Outgoing', function () {
		it('should enable call blocking for outgoing calls', function (done) {
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				assert.equal(request.body[0].op, 'replace')
				assert.equal(request.body[0].path, '/block_out_mode')
				assert.equal(request.body[0].value, true)
				next(request.respondWith('', {
					status: 204
				}))
			})
			enableOutgoingCallBlocking(subscriberId).then(() => {
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should disable call blocking for outgoing calls', function (done) {
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				assert.equal(request.body[0].op, 'replace')
				assert.equal(request.body[0].path, '/block_out_mode')
				assert.equal(request.body[0].value, false)
				next(request.respondWith('', {
					status: 204
				}))
			})
			disableOutgoingCallBlocking(subscriberId).then(() => {
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should get all data regarding outgoing call blocking', function (done) {
			var list = [
				'0123456789',
				'0987654321'
			]
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				next(request.respondWith(JSON.stringify({
					block_out_list: list,
					block_out_mode: true
				}), {
					status: 200
				}))
			})
			getOutgoingCallBlocking(subscriberId).then((result) => {
				assert.deepEqual(result.list, list)
				assert.equal(result.enabled, true)
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should add a new number to outgoing call blocking list', function (done) {
			var number = '0987654321'
			var list = [
				'0123456789'
			]
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				if (request.method === 'GET') {
					next(request.respondWith(JSON.stringify({
						block_out_list: list
					}), {
						status: 200
					}))
				} else if (request.method === 'PUT') {
					assert.deepEqual(request.body.block_out_list, [].concat([number], list))
					next(request.respondWith('', {
						status: 200
					}))
				}
			})
			addNumberToOutgoingList(subscriberId, number).then((result) => {
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should edit a number from outgoing call blocking list', function (done) {
			var number = '0987654321'
			var list = [
				'0123456789'
			]
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				if (request.method === 'GET') {
					next(request.respondWith(JSON.stringify({
						block_out_list: list
					}), {
						status: 200
					}))
				} else if (request.method === 'PUT') {
					assert.deepEqual(request.body.block_out_list, [number])
					next(request.respondWith('', {
						status: 200
					}))
				}
			})
			editNumberFromOutgoingList(subscriberId, 0, number).then((result) => {
				done()
			}).catch((err) => {
				done(err)
			})
		})

		it('should remove a number from outgoing call blocking list', function (done) {
			var number = '0987654321'
			var list = [
				'0123456789'
			]
			Vue.http.interceptors.unshift((request, next) => {
				assert.equal(request.url, 'api/subscriberpreferences/' + subscriberId)
				if (request.method === 'GET') {
					next(request.respondWith(JSON.stringify({
						block_out_list: [].concat([number]).concat(list)
					}), {
						status: 200
					}))
				} else if (request.method === 'PUT') {
					assert.deepEqual(request.body.block_out_list, list)
					next(request.respondWith('', {
						status: 200
					}))
				}
			})
			removeNumberFromOutgoingList(subscriberId, 0).then(() => {
				done()
			}).catch((err) => {
				done(err)
			})
		})
	})
})
