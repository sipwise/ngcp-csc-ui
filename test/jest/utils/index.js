// this is mapped in jest.config.js to resolve @vue/test-utils
import { Cookies, Quasar } from 'quasar'
import { createLocalVue, shallowMount } from 'test-utils'
// eslint-disable-next-line import/default
import VueRouter from 'vue-router'
import Vuex from 'vuex'

const mockSsrContext = () => {
    return {
        req: {
            headers: {}
        },
        res: {
            setHeader: () => {
                return undefined
            }
        }
    }
}

// https://eddyerburgh.me/mock-vuex-in-vue-unit-tests
export const mountQuasar = (component, options = {}) => {
    const localVue = createLocalVue()
    const app = {}

    localVue.use(Vuex)
    localVue.use(VueRouter)
    localVue.use(Quasar)
    const store = new Vuex.Store({})
    const router = new VueRouter()

    if (options) {
        const ssrContext = options.ssr ? mockSsrContext() : null

        if (options.cookies) {
            const cookieStorage = ssrContext ? Cookies.parseSSR(ssrContext) : Cookies
            const cookies = options.cookies
            Object.keys(cookies).forEach((key) => {
                cookieStorage.set(key, cookies[key])
            })
        }

        if (options.plugins) {
            options.plugins.forEach((plugin) => {
                plugin({ app, store, router, Vue: localVue, ssrContext })
            })
        }
    }

    // mock vue-i18n
    const $t = () => {}
    const $tc = () => {}
    const $n = () => {}
    const $d = () => {}

    return shallowMount(component, {
        localVue,
        store,
        router,
        mocks: { $t, $tc, $n, $d },
        // Injections for Components with a QPage root Element
        provide: {
            pageContainer: true,
            layout: {
                header: {},
                right: {},
                footer: {},
                left: {}
            }
        }
    })
}
