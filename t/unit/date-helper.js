'use strict'

import { assert } from 'chai'
import { isToday, isWithinLastWeek, isYesterday } from 'src/helpers/date-helper'

describe('Date helper', () => {
    it('should check whether a given date is yesterday or not', () => {
        const today = new Date('2000-01-01 00:00:00')
        const beforeYesterday = new Date('1999-12-30 00:00:00')
        const tomorrow = new Date('2000-01-02 00:00:00')

        const yesterday1 = new Date('1999-12-31 00:00:00')
        const yesterday2 = new Date('1999-12-31 14:00:00')
        const yesterday3 = new Date('1999-12-31 23:59:59')

        assert.isTrue(isYesterday(yesterday1, today))
        assert.isTrue(isYesterday(yesterday2, today))
        assert.isTrue(isYesterday(yesterday3, today))

        assert.isFalse(isYesterday(beforeYesterday, today))
        assert.isFalse(isYesterday(today, today))
        assert.isFalse(isYesterday(tomorrow, today))
    })

    it('should check whether a given date is today or not', () => {
        const today = new Date('2000-01-01 00:00:00')
        const yesterday = new Date('1999-12-31 00:00:00')
        const beforeYesterday = new Date('1999-12-30 00:00:00')
        const tomorrow = new Date('2000-01-02 00:00:00')
        const afterTomorrow = new Date('2000-01-03 00:00:00')

        const today1 = new Date('2000-01-01 00:00:00')
        const today2 = new Date('2000-01-01 14:00:00')
        const today3 = new Date('2000-01-01 23:59:59')

        assert.isTrue(isToday(today, today))
        assert.isTrue(isToday(today1, today))
        assert.isTrue(isToday(today2, today))
        assert.isTrue(isToday(today3, today))

        assert.isFalse(isToday(beforeYesterday, today))
        assert.isFalse(isToday(yesterday, today))
        assert.isFalse(isToday(tomorrow, today))
        assert.isFalse(isToday(afterTomorrow, today))
    })

    it('should check whether a given date is within last week or not', () => {
        const today = new Date('2000-01-01 00:00:00')
        const validDay1 = new Date('1999-12-31 00:00:00')
        const validDay2 = new Date('1999-12-30 00:00:00')
        const validDay3 = new Date('1999-12-29 00:00:00')
        const validDay4 = new Date('1999-12-28 00:00:00')
        const validDay5 = new Date('1999-12-27 00:00:00')
        const validDay6 = new Date('1999-12-26 00:00:00')

        const invalidDay1 = new Date('1999-12-25 00:00:00')
        const invalidDay2 = new Date('1999-12-24 00:00:00')
        const invalidDay3 = new Date('1999-12-23 00:00:00')

        assert.isTrue(isWithinLastWeek(validDay1, today))
        assert.isTrue(isWithinLastWeek(validDay2, today))
        assert.isTrue(isWithinLastWeek(validDay3, today))
        assert.isTrue(isWithinLastWeek(validDay4, today))
        assert.isTrue(isWithinLastWeek(validDay5, today))
        assert.isTrue(isWithinLastWeek(validDay6, today))

        assert.isFalse(isWithinLastWeek(today, today))
        assert.isFalse(isWithinLastWeek(invalidDay1, today))
        assert.isFalse(isWithinLastWeek(invalidDay2, today))
        assert.isFalse(isWithinLastWeek(invalidDay3, today))
    })
})
