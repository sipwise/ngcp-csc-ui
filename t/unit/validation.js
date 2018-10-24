
'use strict';

import { assert } from 'chai';
import { customMacAddress } from '../../src/helpers/validation'

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
