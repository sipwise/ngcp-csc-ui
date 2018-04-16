'use strict';

import _ from 'lodash'
import { RequestState } from '../common'

export default {
    listRequesting(state, silent) {
        state.listState = RequestState.requesting;
        state.listError = null;
        state.listLoadingSilently = silent;
    },
    listSucceeded(state, all) {
        state.listState = RequestState.succeeded;
        state.listError = null;
        state.pilot = all.pilot;
        state.groups = {};
        state.groupsOrdered = [];
        state.seats = {};
        state.seatsOrdered = [];
        state.numbersMap = {};
        all.groups.forEach((group)=>{
            state.groups[group.id] = group;
            state.groupsOrdered.push(group);
        });
        all.seats.forEach((seat)=>{
            seat.pbx_group_ids.forEach((groupId)=>{
                let group = state.groups[groupId];
                let seats = _.get(group, 'seats', []);
                seats.push(seat);
                _.set(group, 'seats', seats);
                let groups = _.get(seat, 'groups', []);
                groups.push(group);
                _.set(seat, 'groups', groups);
            });
            state.seats[seat.id] = seat;
            state.seatsOrdered.push(seat);
        });
        if(_.isArray(all.numbers) && all.numbers.length > 0) {
            all.numbers.forEach((number)=>{
                if(_.has(state.groups, number.subscriber_id)) {
                    number.subscriber = state.groups[number.subscriber_id];
                }
                else if (_.has(state.seats, number.subscriber_id)) {
                    number.subscriber = state.seats[number.subscriber_id];
                }
                else if (state.pilot.id === number.subscriber_id) {
                    number.subscriber = state.pilot;
                }
                else {
                    number.subscriber = null;
                }
                state.numbersMap[number.id] = number;
            });
            state.numbers = all.numbers;
        }
        _.reverse(state.groupsOrdered);
        _.reverse(state.seatsOrdered);
    },
    listFailed(state, error) {
        state.listState = RequestState.failed;
        state.listError = error;
    },
    addItemRequesting(state, item) {
        state.addState = RequestState.requesting;
        state.addError = null;
        state.addItem = item;
    },
    addItemSucceeded(state) {
        state.addState = RequestState.succeeded;
        state.addError = null;
    },
    addItemFailed(state, error) {
        state.addState = RequestState.failed;
        state.addError = error;
    },
    updateItemRequesting(state, item) {
        state.updateState = RequestState.requesting;
        state.updateError = null;
        state.updateItem = item;
    },
    updateItemSucceeded(state) {
        state.updateState = RequestState.succeeded;
        state.updateError = null;
    },
    updateItemFailed(state, error) {
        state.updateState = RequestState.failed;
        state.updateError = error;
    },
    removeItemRequesting(state, item) {
        state.removeState = RequestState.requesting;
        state.removeError = null;
        state.removeItem = item;
    },
    removeItemSucceeded(state) {
        state.removeState = RequestState.succeeded;
        state.removeError = null;
    },
    removeItemFailed(state, error) {
        state.removeState = RequestState.failed;
        state.removeError = error;
    },
    removeGroup(state, group) {
        delete state.groups[group.id];
        state.groupsOrdered.forEach(($group, index)=>{
            if(group.id === $group.id) {
                delete state.groupsOrdered[index];
            }
        });
    },
    deviceListRequesting(state, silent) {
        state.listState = RequestState.requesting;
        state.listError = null;
        state.listLoadingSilently = silent;
    },
    deviceListSucceeded(state, data) {
        state.listState = RequestState.succeeded;
        state.listError = null;
        state.devicesOrdered = data.devices.items;
        state.profilesOrdered = data.profiles;
        state.modelsOrdered = data.models;
        state.devicesOrdered.forEach((device)=>{
            state.profilesOrdered.forEach((profile)=>{
                if(device.profile_id === profile.id) {
                    device.profile = profile;
                }
            });
        });
        state.devicesOrdered.forEach((device)=>{
            state.modelsOrdered.forEach((model)=>{
                if(device.profile.device_id === model.id) {
                    device.model = model;
                }
            });
        });
    },
    deviceListFailed(state, error) {
        state.listState = RequestState.failed;
        state.listError = error;
    }
}
