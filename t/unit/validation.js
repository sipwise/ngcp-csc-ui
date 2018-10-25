
'use strict';

import { assert } from 'chai';
import { userInfo } from '../../src/helpers/validation'

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

