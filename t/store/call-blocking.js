'use strict'

import CallBlockingModule from '../../src/store/call-blocking'
import { assert } from 'chai'

describe('CallBlocking', function () {
    describe('Incoming', function () {
        it('should enable list', function () {
            const state = {}
            CallBlockingModule.mutations.toggleSucceeded(state, true)
            assert.equal(state.enabled, true)
        })

        it('should disable list', function () {
            const state = {}
            CallBlockingModule.mutations.toggleSucceeded(state, false)
            assert.equal(state.enabled, false)
        })

        it('should load list and flag', function () {
            const state = {}
            const list = [
                '0123456789',
                '0987654321'
            ]
            CallBlockingModule.mutations.numberListSucceeded(state, {
                enabled: true,
                list: list
            })
            assert.equal(state.enabled, true)
            assert.deepEqual(state.list, list)
        })
    })

    describe('Outgoing', function () {
        it('should enable list', function () {
            const state = {}
            CallBlockingModule.mutations.toggleSucceeded(state, true)
            assert.equal(state.enabled, true)
        })

        it('should disable list', function () {
            const state = {}
            CallBlockingModule.mutations.toggleSucceeded(state, false)
            assert.equal(state.enabled, false)
        })

        it('should load list and flag', function () {
            const state = {}
            const list = [
                '0123456789',
                '0987654321'
            ]
            CallBlockingModule.mutations.numberListSucceeded(state, {
                enabled: true,
                list: list
            })
            assert.equal(state.enabled, true)
            assert.deepEqual(state.list, list)
        })
    })
})
