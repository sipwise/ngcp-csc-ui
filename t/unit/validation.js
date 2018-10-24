
'use strict';

import { assert } from 'chai';
import {
    userInfo,
    customMacAddress
} from '../../src/helpers/validation'

describe('Userinfo validation helper', function() {

    it('should validate userinfo consisting of phone number and country code', function() {
        let input = "+439988776655";
        assert.isTrue(userInfo(input));
    });

    it('should validate userinfo with parameter', function() {
        let input = "+358-555-1234567;postd=pp22";
        assert.isTrue(userInfo(input));
    });

    it('should validate userinfo consisting of subscriber username', function() {
        let input = "alice";
        assert.isTrue(userInfo(input));
    });

    it('should not validate invalid userinfo characters', function() {
        let input = "al)<e";
        assert.isFalse(userInfo(input));
    });

});

describe('Custom mac address validation helper', function() {

    it('should validate mac address separated by colon', function() {
        let input = "13:14:5f:cD:42:5f";
        assert.isTrue(customMacAddress(input));
    });

    it('should validate mac address separated by hyphen', function() {
        let input = "13-14-5f-cD-42-5f";
        assert.isTrue(customMacAddress(input));
    });

    it('should validate mac address without separator', function() {
        let input = "13145fcD425f";
        assert.isTrue(customMacAddress(input));
    });

    it('should not validate mac address with mixed separator', function() {
        let input = "13:14:5f:cD:42-5f";
        assert.isFalse(customMacAddress(input));
    });

    it('should not validate mac address when invalid', function() {
        let input = "k183p1r23411";
        assert.isFalse(customMacAddress(input));
    });

});
