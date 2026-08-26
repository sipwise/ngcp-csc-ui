import { mount } from '@vue/test-utils'
import {
    useActions, useGetters, useMutations, useState
} from 'src/composables/useStore'
import { defineComponent, h } from 'vue'
import { createStore } from 'vuex'

function createUserModule () {
    return {
        namespaced: true,
        state: () => ({ subscriber: { username: 'alice' }, loginState: 'loggedIn' }),
        getters: {
            isLogged: (state) => state.loginState === 'loggedIn',
            hasSubscriberProfileAttribute: (state) => (attribute) => attribute in state.subscriber
        },
        mutations: {
            setUser (state, subscriber) {
                state.subscriber = subscriber
            }
        },
        actions: {
            login: jest.fn(async (context, credentials) => credentials)
        }
    }
}

function mountComposable (composable, store) {
    let result
    const TestComponent = defineComponent({
        setup () {
            result = composable()
            return () => h('div')
        }
    })
    const wrapper = mount(TestComponent, { global: { plugins: [store] } })
    return { wrapper, result }
}

describe('useStore', () => {
    let store

    beforeEach(() => {
        store = createStore({ modules: { user: createUserModule() } })
    })

    it('useState() returns a computed ref for a single key', () => {
        const { result } = mountComposable(() => useState('user', 'subscriber'), store)
        expect(result.value).toEqual({ username: 'alice' })
    })

    it('useState() returns an object of computed refs for an array of keys', () => {
        const { result } = mountComposable(() => useState('user', ['subscriber', 'loginState']), store)
        expect(result.subscriber.value).toEqual({ username: 'alice' })
        expect(result.loginState.value).toBe('loggedIn')
    })

    it('useGetters() resolves the namespaced getter path', () => {
        const { result } = mountComposable(() => useGetters('user', ['isLogged', 'hasSubscriberProfileAttribute']), store)
        expect(result.isLogged.value).toBe(true)
        expect(result.hasSubscriberProfileAttribute.value('username')).toBe(true)
    })

    it('useActions() dispatches to the namespaced action path and returns the dispatch result', async () => {
        const { result } = mountComposable(() => useActions('user', 'login'), store)
        const response = await result({ username: 'alice', password: 'secret' })
        expect(response).toEqual({ username: 'alice', password: 'secret' })
    })

    it('useMutations() commits to the namespaced mutation path', () => {
        const { result } = mountComposable(() => useMutations('user', 'setUser'), store)
        result({ username: 'bob' })
        expect(store.state.user.subscriber).toEqual({ username: 'bob' })
    })
})
