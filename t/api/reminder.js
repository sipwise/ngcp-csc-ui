'use strict';

import Vue from 'vue';
import VueResource from 'vue-resource';
import {
    createReminder,
    getReminder,
    patchReminder
} from '../../src/api/reminder';
import {
    assert
} from 'chai';

Vue.use(VueResource);


describe('Reminder', function() {

    it('should return 201 when creating a new reminder', function(done) {
        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next) => {
            next(
                request.respondWith('1', {
                    status: 201
                })
            )
        });
        createReminder('123').then((result) => {
            // TODO Check result is an id
            done();
        }).catch((err) => {
            done(new Error('Test failed'));
        });
    });

    it('should get the existing reminder', function(done) {
        Vue.http.interceptors = [];
        Vue.http.interceptors.unshift((request, next) => {
            next(request.respondWith(JSON.stringify({
                "_embedded": {
                    "ngcp:reminders": [{
                        "active": true,
                        "id": 1,
                        "recur": "always",
                        "subscriber_id": 239,
                        "time": "18:47:00"
                    }]
                },
                "total_count": 1
            }), {
                status: 200
            }));
        });
        getReminder('123').then((result) => {
            var reminderData = result._embedded['ngcp:reminders'][0];
            assert.property(reminderData, 'id');
            assert.property(reminderData, 'active');
            assert.property(reminderData, 'recur');
            assert.property(reminderData, 'subscriber_id');
            assert.property(reminderData, 'time');
            assert.isNumber(reminderData.id);
            assert.isTrue(reminderData.active);
            assert.include(['always', 'once', 'weekdays'], reminderData.recur);
            assert.isNumber(reminderData.subscriber_id);
            assert.isString(reminderData.time)
            done();
        }).catch((err) => {
            done(err);
        });
    });

    // TODO
    // patchReminder

});
