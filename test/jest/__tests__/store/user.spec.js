/* eslint-disable */

import UserStore from 'src/store/user'

describe('UserStore', () => {

    it('should initialize login process',() => {
        const state = {}
        UserStore.mutations.loginRequesting(state)
        expect(state.loginRequesting).toBe(true)
        expect(state.loginSucceeded).toBe(false)
        expect(state.loginError).toBe(null)
    })

    it('should login successfully',() => {
        const state = {}
        UserStore.mutations.loginSucceeded(state, {
            jwt: '1234',
            subscriberId: '5678'
        })
        expect(state.loginRequesting).toBe(false)
        expect(state.loginSucceeded).toBe(true)
        expect(state.loginError).toBe(null)
        expect(state.jwt).toBe('1234')
        expect(state.subscriberId).toBe('5678')
    })
})
