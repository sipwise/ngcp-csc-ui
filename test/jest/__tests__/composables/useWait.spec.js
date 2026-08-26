import { mount } from '@vue/test-utils'
import { useWait } from 'src/composables/useWait'
import { defineComponent, h } from 'vue'
import { createStore } from 'vuex'

// Minimal stand-in for the `wait` Vuex module vue-wait-vue3 registers when
// `useVuex: true` (see src/boot/vue-wait.js) — only the getters/actions
// useWait() actually depends on.
function createWaitModule () {
    return {
        namespaced: true,
        state: () => ({ waitingFor: [] }),
        getters: {
            is: (state) => (waiter) => state.waitingFor.includes(waiter)
        },
        mutations: {
            START (state, waiter) {
                state.waitingFor.push(waiter)
            },
            END (state, waiter) {
                state.waitingFor = state.waitingFor.filter((entry) => entry !== waiter)
            }
        },
        actions: {
            start ({ commit }, waiter) {
                commit('START', waiter)
            },
            end ({ commit }, waiter) {
                commit('END', waiter)
            }
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

describe('useWait', () => {
    let store

    beforeEach(() => {
        store = createStore({
            modules: {
                wait: createWaitModule(),
                callSettings: {
                    namespaced: true,
                    actions: {
                        fieldUpdateAction: jest.fn(async (context, payload) => payload)
                    }
                }
            }
        })
    })

    it('is() reflects whether the waiter is active', async () => {
        const { result } = mountComposable(useWait, store)
        expect(result.is('csc-pbx-call-settings-load-preferences').value).toBe(false)

        await result.start('csc-pbx-call-settings-load-preferences')
        expect(result.is('csc-pbx-call-settings-load-preferences').value).toBe(true)

        await result.end('csc-pbx-call-settings-load-preferences')
        expect(result.is('csc-pbx-call-settings-load-preferences').value).toBe(false)
    })

    it('waitFor() starts the waiter before running the action and ends it after', async () => {
        const { result } = mountComposable(useWait, store)
        let waiterDuringAction = null

        await result.waitFor('csc-pbx-call-settings-load-preferences', () => {
            waiterDuringAction = result.is('csc-pbx-call-settings-load-preferences').value
            return Promise.resolve('done')
        })

        expect(waiterDuringAction).toBe(true)
        expect(result.is('csc-pbx-call-settings-load-preferences').value).toBe(false)
    })

    it('waitFor() still ends the waiter when the action throws', async () => {
        const { result } = mountComposable(useWait, store)

        await expect(result.waitFor('csc-pbx-call-settings-load-preferences', () => {
            throw new Error('boom')
        })).rejects.toThrow('boom')

        expect(result.is('csc-pbx-call-settings-load-preferences').value).toBe(false)
    })

    it('waitAction() dispatches into the given module and wraps it with start/end', async () => {
        const { result } = mountComposable(useWait, store)
        const fieldUpdate = result.waitAction('callSettings', 'fieldUpdateAction', 'csc-pbx-call-settings-update-conference-pin')

        const promise = fieldUpdate({ field: 'conference_pin', value: '1234' })
        expect(result.is('csc-pbx-call-settings-update-conference-pin').value).toBe(true)

        const payload = await promise
        expect(payload).toEqual({ field: 'conference_pin', value: '1234' })
        expect(result.is('csc-pbx-call-settings-update-conference-pin').value).toBe(false)
    })

    it('waitAction() defaults the waiter name to the action name', async () => {
        const { result } = mountComposable(useWait, store)
        const fieldUpdate = result.waitAction('callSettings', 'fieldUpdateAction')

        await fieldUpdate({ field: 'conference_pin', value: '1234' })
        expect(result.is('fieldUpdateAction').value).toBe(false)
    })
})
