'use strict';

import { assert } from 'chai';
import numberFormat from '../../src/filters/number-format';
import { normalizeNumber, normalizeDestination } from '../../src/filters/number-format';

const numbers = {
    valid1: '+43 993 004',
    valid2: '43993004',
    valid3: ' 43993004 ',
    valid4: '+43993004',
    valid5: '43 993 004',
    valid6: '4 3 9 9 3 0 0 4',
    valid7: '+4 3 9 9 3 0 0 4',
    valid8: ' +43993004 ',
    invalid1: '43993004+',
    invalid2: '$43993004',
    invalid3: 'a43993004',
    invalid4: 'abcdefghi'
};

const sipUris = {
    valid1: 'sip:43993004@sipwise.com',
    invalid1: 'sip:a43993004@sipwise.com'
};

const destinations = {
    voiceMail: 'sip:vmu@voicebox.local',
    fax2Mail: 'sip:@fax2mail.local',
    managerSecretary: 'sip:@managersecretary.local',
    app: 'sip:app@app.local',
    customHours: 'sip:custom-hours@app.local',
    conference: 'sip:@conference.local',
    number: 'sip:43993004@sipwise.com'
};

describe('NumberFormatFilter', function() {

    it('should normalize phone numbers', function(){
        assert.equal(normalizeNumber(numbers.valid1), numbers.valid1);
        assert.equal(normalizeNumber(numbers.valid2), numbers.valid1);
        assert.equal(normalizeNumber(numbers.valid3), numbers.valid1);
        assert.equal(normalizeNumber(numbers.valid4), numbers.valid1);
        assert.equal(normalizeNumber(numbers.valid5), numbers.valid1);
        assert.equal(normalizeNumber(numbers.valid6), numbers.valid1);
        assert.equal(normalizeNumber(numbers.valid7), numbers.valid1);
        assert.equal(normalizeNumber(numbers.valid8), numbers.valid1);
        assert.equal(normalizeNumber(numbers.invalid1), numbers.invalid1);
        assert.equal(normalizeNumber(numbers.invalid2), numbers.invalid2);
        assert.equal(normalizeNumber(numbers.invalid3), numbers.invalid3);
        assert.equal(normalizeNumber(numbers.invalid4), numbers.invalid4);
    });

    it('should format a number or sip uri', function(){
        assert.equal(numberFormat(sipUris.valid1), numbers.valid1);
        assert.equal(numberFormat(sipUris.invalid1), numbers.invalid3);
    });

    it('should format a call forward destination', function(){
        assert.equal(normalizeDestination(destinations.voiceMail), 'Voicemail');
        assert.equal(normalizeDestination(destinations.fax2Mail), 'Fax2Mail');
        assert.equal(normalizeDestination(destinations.managerSecretary), 'Manager Secretary');
        assert.equal(normalizeDestination(destinations.app), 'App');
        assert.equal(normalizeDestination(destinations.customHours), 'Custom Announcement');
        assert.equal(normalizeDestination(destinations.conference), 'Conference');
        assert.equal(normalizeDestination(destinations.number), numbers.valid1);
    });
});
