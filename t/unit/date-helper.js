'use strict';

import { assert } from 'chai';
import { isYesterday, isToday, isWithinLastWeek } from '../../src/helpers/date-helper'

describe('Date helper', function() {

    it('should check whether a given date is yesterday or not', function() {
        let today = new Date('2000-01-01 00:00:00');
        let beforeYesterday = new Date('1999-12-30 00:00:00');
        let tomorrow = new Date('2000-01-02 00:00:00');

        let yesterday1 = new Date('1999-12-31 00:00:00');
        let yesterday2 = new Date('1999-12-31 14:00:00');
        let yesterday3 = new Date('1999-12-31 23:59:59');

        assert.isTrue(isYesterday(yesterday1, today));
        assert.isTrue(isYesterday(yesterday2, today));
        assert.isTrue(isYesterday(yesterday3, today));

        assert.isFalse(isYesterday(beforeYesterday, today));
        assert.isFalse(isYesterday(today, today));
        assert.isFalse(isYesterday(tomorrow, today));
    });

    it('should check whether a given date is today or not', function() {
        let today = new Date('2000-01-01 00:00:00');
        let yesterday = new Date('1999-12-31 00:00:00');
        let beforeYesterday = new Date('1999-12-30 00:00:00');
        let tomorrow = new Date('2000-01-02 00:00:00');
        let afterTomorrow = new Date('2000-01-03 00:00:00');

        let today1 = new Date('2000-01-01 00:00:00');
        let today2 = new Date('2000-01-01 14:00:00');
        let today3 = new Date('2000-01-01 23:59:59');

        assert.isTrue(isToday(today, today));
        assert.isTrue(isToday(today1, today));
        assert.isTrue(isToday(today2, today));
        assert.isTrue(isToday(today3, today));

        assert.isFalse(isToday(beforeYesterday, today));
        assert.isFalse(isToday(yesterday, today));
        assert.isFalse(isToday(tomorrow, today));
        assert.isFalse(isToday(afterTomorrow, today));
    });

    it('should check whether a given date is within last week or not', function(){

        let today = new Date('2000-01-01 00:00:00');
        let validDay1 = new Date('1999-12-31 00:00:00');
        let validDay2 = new Date('1999-12-30 00:00:00');
        let validDay3 = new Date('1999-12-29 00:00:00');
        let validDay4 = new Date('1999-12-28 00:00:00');
        let validDay5 = new Date('1999-12-27 00:00:00');
        let validDay6 = new Date('1999-12-26 00:00:00');

        let invalidDay1 = new Date('1999-12-25 00:00:00');
        let invalidDay2 = new Date('1999-12-24 00:00:00');
        let invalidDay3 = new Date('1999-12-23 00:00:00');

        assert.isTrue(isWithinLastWeek(validDay1, today));
        assert.isTrue(isWithinLastWeek(validDay2, today));
        assert.isTrue(isWithinLastWeek(validDay3, today));
        assert.isTrue(isWithinLastWeek(validDay4, today));
        assert.isTrue(isWithinLastWeek(validDay5, today));
        assert.isTrue(isWithinLastWeek(validDay6, today));

        assert.isFalse(isWithinLastWeek(today, today));
        assert.isFalse(isWithinLastWeek(invalidDay1, today));
        assert.isFalse(isWithinLastWeek(invalidDay2, today));
        assert.isFalse(isWithinLastWeek(invalidDay3, today));
    });
});
