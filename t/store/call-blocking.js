'use strict'

import { assert } from 'chai'
import CallBlockingModule from 'src/store/call-blocking'

describe('CallBlocking', () => {
    describe('Incoming', () => {
        it('should enable list', () => {
            const state = {}
            CallBlockingModule.mutations.toggleSucceeded(state, true)
            assert.equal(state.enabled, true)
        })

        it('should disable list', () => {
            const state = {}
            CallBlockingModule.mutations.toggleSucceeded(state, false)
            assert.equal(state.enabled, false)
        })

        it('should load list and flag', () => {
            const state = {}
            const list = [
                '0123456789',
                '0987654321'
            ]
            CallBlockingModule.mutations.numberListSucceeded(state, {
                enabled: true,
                list
            })
            assert.equal(state.enabled, true)
            assert.deepEqual(state.list, list)
        })
    })

    describe('Outgoing', () => {
        it('should enable list', () => {
            const state = {}
            CallBlockingModule.mutations.toggleSucceeded(state, true)
            assert.equal(state.enabled, true)
        })

        it('should disable list', () => {
            const state = {}
            CallBlockingModule.mutations.toggleSucceeded(state, false)
            assert.equal(state.enabled, false)
        })

        it('should load list and flag', () => {
            const state = {}
            const list = [
                '0123456789',
                '0987654321'
            ]
            CallBlockingModule.mutations.numberListSucceeded(state, {
                enabled: true,
                list
            })
            assert.equal(state.enabled, true)
            assert.deepEqual(state.list, list)
        })
    })
})
