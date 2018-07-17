
import Vue from 'vue'
import _ from 'lodash'
import { getJsonBody } from './utils'

export function getSpeedDials(id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('api/speeddials/' + id).then((result) => {
            let speeddialAssignments = getJsonBody(result.body).speeddials;
            let filteredAssignments = speeddialAssignments.filter((assignment) => {
                let slotNum = parseInt(assignment.slot.substr(1));
                return slotNum < 10;
            });
            resolve(filteredAssignments);
        }).catch((err) => {
            reject(err.body.message);
        });
    });
}

export function getUnassignedSpeedDialSlots(id) {
    return new Promise((resolve, reject) => {
        let slots = ["*0", "*1", "*2", "*3", "*4", "*5", "*6", "*7", "*8", "*9"];
        Promise.resolve().then(() => {
            return getSpeedDials(id);
        }).then((assignedSlots) => {
			let unassignedSlots = _.difference(slots, assignedSlots.map((slot) => {
				return slot.slot;
			}));
			// TODO: Create slotOptions array with slot objects for the selection/drop-down
            resolve(unassignedSlots);
        }).catch((err) => {
            reject(err);
        });
    });
}
