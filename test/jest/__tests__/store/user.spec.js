jest.mock('boot/i18n', () => ({ i18n: { global: { t: (key) => key } } }), { virtual: true })
jest.mock('qrcode', () => ({}))
jest.mock('src/api/common', () => ({}))
jest.mock('src/api/ngcp-call', () => ({}))
jest.mock('src/api/subscriber', () => ({}))
jest.mock('src/api/user', () => ({}))
jest.mock('src/auth', () => ({}))
jest.mock('src/helpers/call-utils', () => ({}))
jest.mock('src/helpers/ui', () => ({}))
jest.mock('src/router/routes', () => ({}))
jest.mock('src/storage', () => ({}))

import userModule from 'src/store/user'

const { getters } = userModule

function profileState (attributes) {
    return { profile: attributes === null ? null : { attributes } }
}

function profileGetters (attributes) {
    const state = profileState(attributes)
    const isAdminManageOnly = getters.isAdminManageOnly(state)
    const computed = {
        isAdminManageOnly,
        profileAttributes: getters.profileAttributes(state, { isAdminManageOnly })
    }
    computed.hasSubscriberProfileAttribute = getters.hasSubscriberProfileAttribute(state, computed)
    computed.hasSomeSubscriberProfileAttributes = getters.hasSomeSubscriberProfileAttributes(state, computed)
    return { state, ...computed }
}

describe('user store profile attribute getters', () => {
    describe('isAdminManageOnly', () => {
        it('is true only when admin_manage_only is in the profile attributes', () => {
            expect(getters.isAdminManageOnly(profileState(['admin_manage_only']))).toBe(true)
            expect(getters.isAdminManageOnly(profileState(['cdr']))).toBe(false)
            expect(getters.isAdminManageOnly(profileState(null))).toBe(false)
        })
    })

    describe('profileAttributes', () => {
        it('is the stored profile attributes when admin_manage_only is off', () => {
            expect(profileGetters(['cdr', 'record_call']).profileAttributes).toEqual(['cdr', 'record_call'])
            expect(profileGetters(null).profileAttributes).toBeUndefined()
        })

        it('applies the admin_manage_only effects without changing the stored profile', () => {
            const stored = ['admin_manage_only', 'record_call', 'csc_calls', 'unknown_flag']
            const { state, profileAttributes } = profileGetters(stored)
            expect(profileAttributes).toEqual(expect.arrayContaining(['cfu', 'phonebook', 'cdr', 'unknown_flag']))
            expect(profileAttributes).not.toContain('record_call')
            expect(profileAttributes).not.toContain('csc_calls')
            expect(state.profile.attributes).toEqual(stored)
        })
    })

    describe('hasSubscriberProfileAttribute', () => {
        it('is true for any attribute when no profile is loaded', () => {
            expect(profileGetters(null).hasSubscriberProfileAttribute('cdr')).toBe(true)
        })

        it('checks the attribute against the profile', () => {
            const { hasSubscriberProfileAttribute } = profileGetters(['cdr'])
            expect(hasSubscriberProfileAttribute('cdr')).toBe(true)
            expect(hasSubscriberProfileAttribute('fax_server')).toBe(false)
        })

        it('follows the admin_manage_only effects', () => {
            const { hasSubscriberProfileAttribute } = profileGetters(['admin_manage_only', 'csc_calls'])
            expect(hasSubscriberProfileAttribute('fax_server')).toBe(true)
            expect(hasSubscriberProfileAttribute('csc_calls')).toBe(false)
        })
    })

    describe('hasSomeSubscriberProfileAttributes', () => {
        it('is true for any attributes when no profile is loaded', () => {
            expect(profileGetters(null).hasSomeSubscriberProfileAttributes(['cfu'])).toBe(true)
        })

        it('checks the attributes against the profile', () => {
            const { hasSomeSubscriberProfileAttributes } = profileGetters(['cfb'])
            expect(hasSomeSubscriberProfileAttributes(['cfu', 'cfb'])).toBe(true)
            expect(hasSomeSubscriberProfileAttributes(['cfu'])).toBe(false)
        })

        it('follows the admin_manage_only effects', () => {
            const { hasSomeSubscriberProfileAttributes } = profileGetters(['admin_manage_only'])
            expect(hasSomeSubscriberProfileAttributes(['cfu'])).toBe(true)
            expect(hasSomeSubscriberProfileAttributes(['csc_conversations', 'record_call'])).toBe(false)
        })
    })

    describe('isFaxFeatureEnabled', () => {
        const build = (attributes, { faxEnabled = true } = {}) => {
            const state = {
                ...profileState(attributes),
                capabilities: { faxserver: faxEnabled },
                platformInfo: { faxserver: true, licenses: ['fax'] }
            }
            return !!getters.isFaxFeatureEnabled(state, profileGetters(attributes))
        }

        it('follows fax_server', () => {
            expect(build(['fax_server'])).toBe(true)
            expect(build([])).toBe(false)
        })

        it('is on with admin_manage_only, which forces fax_server on', () => {
            expect(build(['admin_manage_only'])).toBe(true)
        })

        it('is off when the platform has no fax support, even with admin_manage_only', () => {
            expect(build(['admin_manage_only', 'fax_server'], { faxEnabled: false })).toBe(false)
        })
    })
})
