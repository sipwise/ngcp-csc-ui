'use strict';

import _ from 'lodash';
import {
    getReminder,
    createReminder,
    enableReminder,
    disableReminder,
    setTime,
    setRecurrence
} from '../api/reminder';


export default {
    namespaced: true,
    mutations: {
        reminderLoaded(state, options) {
            state.reminderID = options.id;
            state.active = options.active;
            state.time = options.time;
            state.recurrence = options.recur;
        },
        enableReminder(state) {
            state.active = true;
        },
        disableReminder(state) {
            state.active = false;
        },
        setTime(state, newTime) {
            state.time = newTime;
        },
        setRecurrence(state, recurrence) {
            state.recurrence = recurrence;
        },
        reminderCreated(state, reminderID) {
            state.reminderID = reminderID;
        }
    },
    actions: {
        loadReminder(context) {
            return new Promise((resolve, reject) => {
                getReminder(localStorage.getItem('subscriberId')).then((result) => {
                    if (result.total_count > 0) {
                        context.commit('reminderLoaded', result._embedded['ngcp:reminders'][0]); // open to suggestions on how to extract data here
                    } else {
                        // If no default reminder is set, then we need to create it.
                        createReminder(localStorage.getItem('subscriberId')).then((result) => {
                            context.commit('reminderCreated', result);
                            resolve();
                        }).catch((err) => {
                            reject(err);
                        });
                    }
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            });
        },
        toggleReminder(context, enabled) {
            return new Promise((resolve, reject) => {
                if (enabled === true) {
                    enableReminder(context.state.reminderID).then((result) => {
                        context.commit('enableReminder');
                        resolve();
                    }).catch((err) => {
                        reject(err);
                    });
                } else {
                    disableReminder(context.state.reminderID).then((result) => {
                        context.commit('disableReminder');
                        resolve();
                    }).catch((err) => {
                        reject(err);
                    });
                }
            });
        },
        changeTime(context, time) {
            return new Promise((resolve, reject) => {
                setTime(context.state.reminderID, time).then((result) => {
                    context.commit('setTime', time);
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            });
        },
        changeRecurrence(context, recurrence) {
            return new Promise((resolve, reject) => {
                setRecurrence(context.state.reminderID, recurrence).then((result) => {
                    context.commit('setRecurrence', recurrence);
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            });
        }
    }
};
