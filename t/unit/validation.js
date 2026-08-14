'use strict'

import { assert } from 'chai'
import {
    customMacAddress,
    userInfo
} from 'src/helpers/validation'

describe('Userinfo validation helper', () => {
    it('should validate userinfo consisting of phone number and country code', () => {
        const input = '+439988776655'
        assert.isTrue(userInfo(input))
    })

    it('should validate userinfo with parameter', () => {
        const input = '+358-555-1234567;postd=pp22'
        assert.isTrue(userInfo(input))
    })

    it('should validate userinfo consisting of subscriber username', () => {
        const input = 'alice'
        assert.isTrue(userInfo(input))
    })

    it('should not validate invalid userinfo characters', () => {
        const input = 'al)<e'
        assert.isFalse(userInfo(input))
    })
})

describe('Custom mac address validation helper', () => {
    it('should validate mac address separated by colon', () => {
        const input = '13:14:5f:cD:42:5f'
        assert.isTrue(customMacAddress(input))
    })

    it('should validate mac address separated by hyphen', () => {
        const input = '13-14-5f-cD-42-5f'
        assert.isTrue(customMacAddress(input))
    })

    it('should validate mac address without separator', () => {
        const input = '13145fcD425f'
        assert.isTrue(customMacAddress(input))
    })

    it('should not validate mac address with mixed separator', () => {
        const input = '13:14:5f:cD:42-5f'
        assert.isFalse(customMacAddress(input))
    })

    it('should not validate mac address when invalid', () => {
        const input = 'k183p1r23411'
        assert.isFalse(customMacAddress(input))
    })
})
