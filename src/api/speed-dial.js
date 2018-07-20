
import _ from 'lodash'
import Vue from 'vue';
import { getFieldList } from './common'

export function getSpeedDials(id) {
    return new Promise((resolve, reject) => {
        getFieldList({
            path: 'api/speeddials/' + id,
            field: 'speeddials'
        }).then((result) => {
            let sortedResult = _.sortBy(result, ['slot']);
            resolve(sortedResult);
        }).catch((err) => {
            reject(err.body.message);
        });
    });
}

export function getUnassignedSlots(id) {
    return new Promise((resolve, reject) => {
        let slots = ["*0", "*1", "*2", "*3", "*4", "*5", "*6", "*7", "*8", "*9"];
        Promise.resolve().then(() => {
            return getSpeedDials(id);
        }).then((assignedSlots) => {
            // TODO: Split into own testable function that takes slots and
            // unassigned slots, and outputs slotOptions array ready to be
            // consumed by q-select
            let unassignedSlots = _.difference(slots, assignedSlots.map((slot) => {
                return slot.slot;
            }));
            resolve(unassignedSlots);
        }).catch((err) => {
            reject(err.body.message);
        });
    });
}

export function unassignSpeedDialSlot(options) {
    return new Promise((resolve, reject) => {
        let updatedAssignedSlots = _.without(options.slots, options.slot);
        let headers = {
            'Content-Type': 'application/json-patch+json'
        };
        Vue.http.patch('api/speeddials/' + options.id, [{
            op: 'replace',
            path: '/speeddials',
            value: updatedAssignedSlots
        }], { headers: headers }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err.body.message);
        });
    });
}
