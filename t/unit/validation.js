
'use strict'

import { assert } from 'chai'
import {
    userInfo,
    customMacAddress
} from '../../src/helpers/validation'

describe('Userinfo validation helper', function () {
    it('should validate userinfo consisting of phone number and country code', function () {
        const input = '+439988776655'
        assert.isTrue(userInfo(input))
    })

    it('should validate userinfo with parameter', function () {
        const input = '+358-555-1234567;postd=pp22'
        assert.isTrue(userInfo(input))
    })

    it('should validate userinfo consisting of subscriber username', function () {
        const input = 'alice'
        assert.isTrue(userInfo(input))
    })

    it('should not validate invalid userinfo characters', function () {
        const input = 'al)<e'
        assert.isFalse(userInfo(input))
    })
})

describe('Custom mac address validation helper', function () {
    it('should validate mac address separated by colon', function () {
        const input = '13:14:5f:cD:42:5f'
        assert.isTrue(customMacAddress(input))
    })

    it('should validate mac address separated by hyphen', function () {
        const input = '13-14-5f-cD-42-5f'
        assert.isTrue(customMacAddress(input))
    })

    it('should validate mac address without separator', function () {
        const input = '13145fcD425f'
        assert.isTrue(customMacAddress(input))
    })

    it('should not validate mac address with mixed separator', function () {
        const input = '13:14:5f:cD:42-5f'
        assert.isFalse(customMacAddress(input))
    })

    it('should not validate mac address when invalid', function () {
        const input = 'k183p1r23411'
        assert.isFalse(customMacAddress(input))
    })
})
