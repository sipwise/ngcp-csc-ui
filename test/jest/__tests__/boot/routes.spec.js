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

import routesBoot from 'src/boot/routes'
import { store } from 'src/boot/store'

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
})
