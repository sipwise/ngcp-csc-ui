'use strict';

import Reminder from '../../src/store/reminder';
import {
    assert
} from 'chai';

describe('Reminder', () => {

    it('should load reminder data', () => {
        var state = {};
        var data = {
            id: '1',
            active: true,
            time: '23:23:00',
            recur: 'always'
        };
        Reminder.mutations.reminderLoaded(state, data);
        assert.equal(state.reminderID, data.id);
        assert.equal(state.active, data.active);
        assert.equal(state.time, data.time);
        assert.equal(state.recurrence, data.recur);
    });

    it('should enable/disable the reminder', () => {
        var state = {};
        Reminder.mutations.enableReminder(state);
        assert.equal(state.active, true);
        Reminder.mutations.disableReminder(state);
        assert.equal(state.active, false);
    });

    it('should set reminder time', () => {
        var state = {};
        var time = '23:23:00'
        Reminder.mutations.setTime(state, time);
        assert.equal(state.time, time);
    });

    it('should set reminder recurrence', () => {
        var state = {};
        var recurrence = 'always'
        Reminder.mutations.setRecurrence(state, recurrence);
        assert.equal(state.recurrence, recurrence);
    });

    it('should set reminder id', () => {
        var state = {};
        var reminderID = '1'
        Reminder.mutations.reminderCreated(state, reminderID);
        assert.equal(state.reminderID, reminderID);
    });

});
