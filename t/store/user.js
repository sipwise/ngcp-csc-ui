'use strict'

import { assert } from 'chai'
import UserModule from 'src/store/user'

describe('UserModule', () => {
    it('should login', () => {
        const state = {}
        UserModule.mutations.loginSucceeded(state, {
            jwt: 'abc123',
            subscriberId: 123
        })
        assert.equal(state.jwt, 'abc123')
        assert.equal(state.subscriberId, '123')
    })
})
