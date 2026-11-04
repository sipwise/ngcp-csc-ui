jest.mock('boot/i18n', () => ({ i18n: { global: { t: (key) => key } } }), { virtual: true })

jest.mock('quasar', () => ({
    Dark: { set: jest.fn() }
}))

jest.mock('src/auth', () => ({
    hasJwt: jest.fn(() => true),
    getJwt: jest.fn(() => 'jwt-token'),
    getSubscriberId: jest.fn(() => 1)
}))

jest.mock('src/boot/store', () => ({
    store: {
        getters: {},
        commit: jest.fn()
    }
}))

jest.mock('qrcode', () => ({}))
jest.mock('src/api/common', () => ({}))
jest.mock('src/api/ngcp-call', () => ({}))
jest.mock('src/api/subscriber', () => ({}))
jest.mock('src/api/user', () => ({}))
jest.mock('src/helpers/call-utils', () => ({}))
jest.mock('src/helpers/ui', () => ({}))
jest.mock('src/storage', () => ({}))

import routesBoot from 'src/boot/routes'
import { store } from 'src/boot/store'
import { PROFILE_ATTRIBUTE_MAP } from 'src/constants'
import routes from 'src/router/routes'
import userModule from 'src/store/user'
import { createMemoryHistory, createRouter } from 'vue-router'

const userGetters = userModule.getters

// Routes reachable in admin_manage_only mode. A change here must be a deliberate decision:
// keep it in sync with doc/router-navigation-guard.md and with the admin_manage_only table
// in ngcp-admin-ui (src/helpers/admin-manage-only.js).
const ADMIN_MANAGE_ONLY_ROUTES = [
    '/:catchAll(.*)*',
    '/user/*',
    '/user/dashboard',
    '/user/pbx-configuration/auto-attendant',
    '/user/pbx-configuration/call-queues',
    '/user/pbx-configuration/customer-phonebook',
    '/user/pbx-configuration/customer-phonebook/:id',
    '/user/pbx-configuration/customer-phonebook/create',
    '/user/pbx-configuration/customer-phonebook/upload',
    '/user/pbx-configuration/customer-preferences',
    '/user/pbx-configuration/device/:id',
    '/user/pbx-configuration/devices',
    '/user/pbx-configuration/group/:id',
    '/user/pbx-configuration/groups',
    '/user/pbx-configuration/ms-configs',
    '/user/pbx-configuration/seat/:id',
    '/user/pbx-configuration/seats',
    '/user/pbx-configuration/sound-sets',
    '/user/pbx-configuration/sound-sets/:id',
    '/user/pbx-statistics/cdr',
    '/user/registered-devices',
    '/user/settings'
]

const router = createRouter({ history: createMemoryHistory(), routes })

// leaf routes only: the guard always runs against the matched leaf
const pageRoutes = router.getRoutes().filter((record) => record.children.length === 0)

function resolveRecord (record) {
    // fill in params (including the catch-all one) so the record resolves to itself
    return router.resolve(record.path.replace(/:\w+(\([^)]*\)\*?)?/g, '1'))
}

function installGuard () {
    const guardRouter = { beforeEach: jest.fn(), afterEach: jest.fn() }
    routesBoot({ app: {}, router: guardRouter })
    return guardRouter.beforeEach.mock.calls[0][0]
}

describe('route table (src/router/routes.js)', () => {
    describe('admin_manage_only', () => {
        it('allows exactly the expected routes', () => {
            const allowed = pageRoutes
                .filter((record) => record.meta?.adminManageOnly)
                .map((record) => record.path)
                .sort()

            expect(allowed).toEqual([...ADMIN_MANAGE_ONLY_ROUTES].sort())
        })

        describe('navigation guard against the real routes', () => {
            let next

            beforeEach(() => {
                jest.clearAllMocks()
                next = jest.fn()
                const state = { profile: { attributes: ['admin_manage_only'] } }
                const isAdminManageOnly = userGetters.isAdminManageOnly(state)
                const computed = {
                    isAdminManageOnly,
                    profileAttributes: userGetters.profileAttributes(state, { isAdminManageOnly })
                }
                store.getters = {
                    'user/isAdminManageOnly': isAdminManageOnly,
                    'user/isAdmin': true,
                    'user/hasSubscriberProfileAttribute': userGetters.hasSubscriberProfileAttribute(state, computed),
                    'user/hasSomeSubscriberProfileAttributes': userGetters.hasSomeSubscriberProfileAttributes(state, computed),
                    'user/isSpCe': false,
                    'user/hasLicenses': jest.fn(() => true),
                    'user/hasPlatformFeature': jest.fn(() => true),
                    'user/hasCapability': jest.fn(() => true)
                }
            })

            it.each(ADMIN_MANAGE_ONLY_ROUTES)('lets %s through although the stored profile has no other flag', (path) => {
                const record = pageRoutes.find((item) => item.path === path)
                installGuard()(resolveRecord(record), {}, next)

                expect(next).toHaveBeenCalledWith()
            })

            it('redirects every other /user route to /', () => {
                const blocked = pageRoutes.filter((record) => record.path.startsWith('/user/') &&
                    !ADMIN_MANAGE_ONLY_ROUTES.includes(record.path))
                expect(blocked.length).toBeGreaterThan(0)

                const guard = installGuard()
                const notRedirected = blocked.filter((record) => {
                    next.mockClear()
                    guard(resolveRecord(record), {}, next)
                    return !next.mock.calls.some((args) => args[0] === '/')
                }).map((record) => record.path)

                expect(notRedirected).toEqual([])
            })

            it('shows the 404 page for an unknown URL', () => {
                const to = router.resolve('/user/does-not-exist')
                expect(to.matched.at(-1).path).toBe('/:catchAll(.*)*')

                installGuard()(to, {}, next)

                expect(next).toHaveBeenCalledWith()
            })
        })
    })

    describe('profile attribute gates', () => {
        it('requires the cdr attribute on the CDR route', () => {
            expect(router.resolve('/user/pbx-statistics/cdr').meta.profileAttribute)
                .toBe(PROFILE_ATTRIBUTE_MAP.cdr)
        })

        it('requires the phonebook attribute on every phonebook route', () => {
            const phonebookRoutes = pageRoutes.filter((record) => record.path.includes('phonebook'))
            expect(phonebookRoutes.length).toBeGreaterThan(0)

            const ungated = phonebookRoutes
                .filter((record) => record.meta.profileAttribute !== PROFILE_ATTRIBUTE_MAP.phonebook)
                .map((record) => record.path)

            expect(ungated).toEqual([])
        })
    })
})
