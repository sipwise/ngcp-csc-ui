'use strict';

import Vue from 'vue';
import VueResource from 'vue-resource';
import {
    createReminder,
    getReminder,
    enableReminder,
    disableReminder,
    setTime,
    setRecurrence
} from '../../src/api/reminder';
import {
    assert
} from 'chai';

Vue.use(VueResource);


describe('Reminder', function() {

    var subscriberId = 123;
    var reminderID = 1;

    beforeEach(function() {
        Vue.http.interceptors = [];
    });

    it('should return 201 when creating a new reminder', function(done) {
        Vue.http.interceptors.unshift((request, next) => {
            assert.equal(request.url, 'api/reminders/');
            assert.equal(request.body.subscriber_id, subscriberId);
            assert.equal(request.body.time, '00:00');
            assert.equal(request.body.recur, 'never');
            assert.equal(request.body.active, false);
            next(
                request.respondWith('', {
                    status: 201,
                    headers: {
                        location: 'api/reminders/' + reminderID
                    }
                })
            )
        });
        createReminder(subscriberId).then((result) => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should get the existing reminder', function(done) {
        Vue.http.interceptors.unshift((request, next) => {
            assert.equal(request.url, 'api/reminders/');
            assert.equal(request.params.supplier_id, subscriberId);
            next(request.respondWith(JSON.stringify({
                "_embedded": {
                    "ngcp:reminders": [{
                        "active": true,
                        "id": reminderID,
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
        getReminder(subscriberId).then((result) => {
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

    it('should activate a reminder', function(done) {
        Vue.http.interceptors.unshift((request, next) => {
            assert.equal(request.url, 'api/reminders/' + reminderID);
            assert.equal(request.body[0].op, 'replace');
            assert.equal(request.body[0].path, '/active');
            assert.equal(request.body[0].value, true);
            next(request.respondWith('', {
                status: 204
            }));
        });
        enableReminder(reminderID).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should deactivate a reminder', function(done) {
        Vue.http.interceptors.unshift((request, next) => {
            assert.equal(request.url, 'api/reminders/' + reminderID);
            assert.equal(request.body[0].op, 'replace');
            assert.equal(request.body[0].path, '/active');
            assert.equal(request.body[0].value, false);
            next(request.respondWith('', {
                status: 204
            }));
        });
        disableReminder(reminderID).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should set reminder time', function(done) {
        Vue.http.interceptors.unshift((request, next) => {
            assert.equal(request.url, 'api/reminders/' + reminderID);
            assert.equal(request.body[0].op, 'replace');
            assert.equal(request.body[0].path, '/time');
            assert.equal(request.body[0].value, '22:22:00');
            next(request.respondWith('', {
                status: 204
            }));
        });
        setTime(reminderID, '22:22:00').then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('should set reminder recurrence', function(done) {
        Vue.http.interceptors.unshift((request, next) => {
            assert.equal(request.url, 'api/reminders/' + reminderID);
            assert.equal(request.body[0].op, 'replace');
            assert.equal(request.body[0].path, '/recur');
            assert.equal(request.body[0].value, 'always');
            next(request.respondWith('', {
                status: 204
            }));
        });
        setRecurrence(reminderID, 'always').then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

});
