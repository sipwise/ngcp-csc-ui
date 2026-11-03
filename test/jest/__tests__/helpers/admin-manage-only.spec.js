import {
    ADMIN_MANAGE_ONLY,
    ADMIN_MANAGE_ONLY_EFFECT,
    setAdminManageOnly
} from 'src/helpers/admin-manage-only'

const forcedOnFlags = Object.keys(ADMIN_MANAGE_ONLY_EFFECT).filter((flag) => ADMIN_MANAGE_ONLY_EFFECT[flag] !== 'off')

describe('setAdminManageOnly', () => {
    it('stores the listed flags as their effect says when enabled, keeping flags not listed', () => {
        const result = setAdminManageOnly(['cfu', 'record_call', 'csc_calls', 'unknown_flag'], true)
        expect(result).toEqual(expect.arrayContaining([ADMIN_MANAGE_ONLY, ...forcedOnFlags, 'unknown_flag']))
        expect(result).not.toContain('record_call')
        expect(result).not.toContain('csc_calls')
        expect(result).toHaveLength(forcedOnFlags.length + 2)
    })

    it('does not duplicate flags already on', () => {
        const result = setAdminManageOnly([ADMIN_MANAGE_ONLY, 'cfu', 'cdr'], true)
        expect(new Set(result).size).toBe(result.length)
    })

    it('only removes admin_manage_only when disabled, so no subscriber value gets deleted', () => {
        expect(setAdminManageOnly([ADMIN_MANAGE_ONLY, 'cfu', 'cdr', 'unknown_flag'], false))
            .toEqual(['cfu', 'cdr', 'unknown_flag'])
    })

    it('handles missing attributes', () => {
        expect(setAdminManageOnly(undefined, false)).toEqual([])
        expect(setAdminManageOnly(undefined, true)).toHaveLength(forcedOnFlags.length + 1)
    })
})
