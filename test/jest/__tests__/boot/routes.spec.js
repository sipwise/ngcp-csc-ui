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

jest.mock('boot/i18n', () => ({ i18n: { global: { t: (key) => key } } }), { virtual: true })
jest.mock('qrcode', () => ({}))
jest.mock('src/api/common', () => ({}))
jest.mock('src/api/ngcp-call', () => ({}))
jest.mock('src/api/subscriber', () => ({}))
jest.mock('src/api/user', () => ({}))
jest.mock('src/helpers/call-utils', () => ({}))
jest.mock('src/helpers/ui', () => ({}))
jest.mock('src/router/routes', () => ({}))
jest.mock('src/storage', () => ({}))

import routesBoot from 'src/boot/routes'
import { store } from 'src/boot/store'
import userModule from 'src/store/user'

const userGetters = userModule.getters

function createRouter () {
    return {
        beforeEach: jest.fn(),
        afterEach: jest.fn()
    }
}

function installGuard () {
    const router = createRouter()
    routesBoot({ app: {}, router })
    return router.beforeEach.mock.calls[0][0]
}

describe('router guard (src/boot/routes.js)', () => {
    let next

    beforeEach(() => {
        jest.clearAllMocks()
        next = jest.fn()
        store.getters = {
            'user/isAdmin': false,
            'user/hasSubscriberProfileAttribute': jest.fn(() => true),
            'user/hasSomeSubscriberProfileAttributes': jest.fn(() => true),
            'user/isSpCe': false,
            'user/hasLicenses': jest.fn((licenses) => licenses.every((license) => ['pbx', 'phonebook'].includes(license))),
            'user/hasPlatformFeature': jest.fn(() => true),
            'user/hasCapability': jest.fn((capability) => capability === 'cloudPbx')
        }
    })

    describe('license check', () => {
        it('allows a route with no licenses requirement', () => {
            const guard = installGuard()
            guard({ path: '/dashboard', meta: {} }, {}, next)

            expect(store.getters['user/hasLicenses']).not.toHaveBeenCalled()
            expect(next).toHaveBeenCalledWith()
        })

        it('allows a route whose single required license is active', () => {
            const guard = installGuard()
            guard({ path: '/pbx-configuration', meta: { licenses: ['pbx'] } }, {}, next)

            expect(next).toHaveBeenCalledWith()
        })

        it('allows a route whose multiple required licenses are all active', () => {
            const guard = installGuard()
            guard({ path: '/pbx-configuration/customer-phonebook', meta: { licenses: ['pbx', 'phonebook'] } }, {}, next)

            expect(next).toHaveBeenCalledWith()
        })

        it('blocks a route when one of several required licenses is missing', () => {
            const guard = installGuard()
            guard({ path: '/fax-server', meta: { licenses: ['pbx', 'fax'] } }, {}, next)

            expect(next).toHaveBeenCalledWith('/')
        })

        it('bypasses the license check for CE users on a route that allows CE', () => {
            store.getters['user/isSpCe'] = true
            const guard = installGuard()
            guard({ path: '/subscriber-phonebook', meta: { licenses: ['phonebook'], allowCE: true } }, {}, next)

            expect(store.getters['user/hasLicenses']).not.toHaveBeenCalled()
            expect(next).toHaveBeenCalledWith()
        })

        it('blocks CE users from a licensed route that does not allow CE', () => {
            store.getters['user/isSpCe'] = true
            const guard = installGuard()
            guard({ path: '/pbx-configuration', meta: { licenses: ['pbx'] } }, {}, next)

            expect(next).toHaveBeenCalledWith('/')
        })
    })

    describe('capability check', () => {
        it('allows a route with no capability requirement', () => {
            const guard = installGuard()
            guard({ path: '/dashboard', meta: {} }, {}, next)

            expect(store.getters['user/hasCapability']).not.toHaveBeenCalled()
            expect(next).toHaveBeenCalledWith()
        })

        it('allows a route whose required capability is present', () => {
            const guard = installGuard()
            guard({ path: '/pbx-configuration', meta: { capability: 'cloudPbx' } }, {}, next)

            expect(store.getters['user/hasCapability']).toHaveBeenCalledWith('cloudPbx')
            expect(next).toHaveBeenCalledWith()
        })

        it('blocks a route when the required capability is missing', () => {
            const guard = installGuard()
            guard({ path: '/call-recording', meta: { capability: 'callRecording' } }, {}, next)

            expect(next).toHaveBeenCalledWith('/')
        })

        it('still evaluates the capability check after passing the license check', () => {
            const guard = installGuard()
            guard({ path: '/pbx-configuration', meta: { licenses: ['pbx'], capability: 'callRecording' } }, {}, next)

            expect(store.getters['user/hasLicenses']).toHaveBeenCalledWith(['pbx'])
            expect(store.getters['user/hasCapability']).toHaveBeenCalledWith('callRecording')
            expect(next).toHaveBeenCalledWith('/')
        })
    })

    describe('admin_manage_only', () => {
        function useProfile (attributes) {
            const state = { profile: { attributes } }
            const isAdminManageOnly = userGetters.isAdminManageOnly(state)
            const computed = {
                isAdminManageOnly,
                profileAttributes: userGetters.profileAttributes(state, { isAdminManageOnly })
            }
            store.getters['user/isAdminManageOnly'] = isAdminManageOnly
            store.getters['user/hasSubscriberProfileAttribute'] = userGetters.hasSubscriberProfileAttribute(state, computed)
            store.getters['user/hasSomeSubscriberProfileAttributes'] = userGetters.hasSomeSubscriberProfileAttributes(state, computed)
        }

        beforeEach(() => {
            store.getters['user/isAdmin'] = true
        })

        it('allows a route marked adminManageOnly', () => {
            useProfile(['admin_manage_only'])
            const guard = installGuard()
            guard({ path: '/user/dashboard', meta: { adminManageOnly: true } }, {}, next)

            expect(next).toHaveBeenCalledWith()
        })

        it('allows a route marked adminManageOnly whose profile attribute is missing from the stored profile', () => {
            useProfile(['admin_manage_only'])
            const guard = installGuard()
            guard({
                path: '/user/pbx-configuration/call-queues',
                meta: { adminManageOnly: true, adminOnly: true, profileAttribute: 'cloud_pbx_callqueue' }
            }, {}, next)

            expect(next).toHaveBeenCalledWith()
        })

        it('allows a route marked adminManageOnly whose profile attributes are missing from the stored profile', () => {
            useProfile(['admin_manage_only'])
            const guard = installGuard()
            guard({
                path: '/user/pbx-configuration/seats',
                meta: { adminManageOnly: true, adminOnly: true, profileAttributes: ['cfu'] }
            }, {}, next)

            expect(next).toHaveBeenCalledWith()
        })

        it('redirects a route not marked adminManageOnly even though its own checks would pass', () => {
            useProfile(['admin_manage_only', 'voice_mail'])
            const guard = installGuard()
            guard({ path: '/user/voicebox', meta: { profileAttribute: 'voice_mail' } }, {}, next)

            expect(next).toHaveBeenCalledWith('/')
        })

        it('still requires admin rights on a route marked adminManageOnly', () => {
            useProfile(['admin_manage_only'])
            store.getters['user/isAdmin'] = false
            const guard = installGuard()
            guard({
                path: '/user/pbx-configuration/groups',
                meta: { adminManageOnly: true, adminOnly: true, profileAttribute: 'csc_hunt_groups' }
            }, {}, next)

            expect(next).toHaveBeenCalledWith('/')
        })

        it('does not restrict other routes when the flag is not set', () => {
            useProfile([])
            const guard = installGuard()
            guard({ path: '/user/voicebox', meta: {} }, {}, next)

            expect(next).toHaveBeenCalledWith()
        })

        it('checks the stored profile attribute when the flag is not set', () => {
            useProfile([])
            const guard = installGuard()
            guard({
                path: '/user/pbx-configuration/call-queues',
                meta: { adminManageOnly: true, adminOnly: true, profileAttribute: 'cloud_pbx_callqueue' }
            }, {}, next)

            expect(next).toHaveBeenCalledWith('/')
        })
    })
})
