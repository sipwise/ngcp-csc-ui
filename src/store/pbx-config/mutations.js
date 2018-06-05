'use strict';

import Vue from 'vue'
import _ from 'lodash'
import { RequestState } from '../common'

export default {
    listRequesting(state, options) {
        options = options || {};
        state.listCurrentPage = _.get(options, 'page', 1);
        state.listLastPage = null;
        state.listLoadingSilently = _.get(options, 'silent', false);
        state.listState = RequestState.requesting;
        state.listError = null;
        state.groups = {};
        state.groupsOrdered = [];
        state.seats = {};
        state.seatsOrdered = [];
        state.numbersMap = {};
    },
    listSucceeded(state, all) {
        state.listState = RequestState.succeeded;
        state.listError = null;
        state.listLastPage = all.lastPage;
        state.pilot = all.pilot;
        state.groups = {};
        state.groupsOrdered = [];
        state.seats = {};
        state.seatsOrdered = [];
        state.numbersMap = {};
        all.groups.items.forEach((group)=>{
            state.groups[group.id] = group;
            state.groupsOrdered.push(group);
        });
        all.seats.items.forEach((seat)=>{
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
    updateAliasNumbersRequesting(state, item) {
        state.updateAliasNumbersState = RequestState.requesting;
        state.updateAliasNumbersError = null;
        state.updateAliasNumbersItem = item;
    },
    updateAliasNumbersSucceeded(state) {
        state.updateAliasNumbersState = RequestState.succeeded;
        state.updateAliasNumbersError = null;
    },
    updateAliasNumbersFailed(state, error) {
        state.updateAliasNumbersState = RequestState.failed;
        state.updateAliasNumbersError = error;
    },
    updateGroupsAndSeatsRequesting(state, item) {
        state.updateGroupsAndSeatsState = RequestState.requesting;
        state.updateGroupsAndSeatsError = null;
        state.updateGroupsAndSeatsItem = item;
    },
    updateGroupsAndSeatsSucceeded(state) {
        state.updateGroupsAndSeatsState = RequestState.succeeded;
        state.updateGroupsAndSeatsError = null;
    },
    updateGroupsAndSeatsFailed(state, error) {
        state.updateGroupsAndSeatsState = RequestState.failed;
        state.updateGroupsAndSeatsError = error;
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
    deviceListRequesting(state, options) {
        options = options || {};
        state.listCurrentPage = _.get(options, 'page', 1);
        state.listLastPage = null;
        state.listLoadingSilently = _.get(options, 'silent', false);
        state.listState = RequestState.requesting;
        state.listError = null;
        state.devices = {};
        state.devicesOrdered = [];
    },
    deviceListSucceeded(state, data) {
        state.listState = RequestState.succeeded;
        state.listError = null;
        state.listLastPage = data.lastPage;
        state.deviceRemoved = null;
        state.devicesOrdered = data.items;
        state.devicesOrdered.forEach((device)=>{
            state.devices[device.id + ""] = device;
        });
    },
    deviceListFailed(state, error) {
        state.listState = RequestState.failed;
        state.listError = error;
    },
    deviceRequesting(state, deviceId) {
        Vue.set(state.deviceStates, deviceId + "", RequestState.requesting);
    },
    deviceSucceeded(state, device) {
        Vue.set(state.deviceStates, device.id + "", RequestState.succeeded);
        Vue.set(state.deviceErrors, device.id + "", null);
        Vue.set(state.devices, device.id + "", device);
        for(let i = 0; i <= state.devicesOrdered.length; i++) {
            if(state.devicesOrdered[i].id === device.id) {
                state.devicesOrdered[i] = device;
            }
        }
    },
    deviceFailed(state, deviceId, error) {
        Vue.set(state.deviceStates, deviceId + "", RequestState.failed);
        Vue.set(state.deviceErrors, deviceId + "", error);
    },
    deviceRemoved(state, device) {
        Vue.set(state.deviceStates, device.id + "", 'deleted');
        Vue.set(state.deviceErrors, device.id + "", null);
        state.deviceRemoved = device;
    },
    lastAddedGroup(state, group) {
        state.lastAddedGroup = group;
    },
    lastRemovedGroup(state, group) {
        state.lastRemovedGroup = group;
    },
    lastAddedSeat(state, seat) {
        state.lastAddedSeat = seat;
    },
    lastRemovedSeat(state, seat) {
        state.lastRemovedSeat = seat;
    },
    lastUpdatedField(state, group) {
        state.lastUpdatedField = group;
    },
    groupsAndSeatsRequesting(state) {
        state.groupsAndSeatsState = RequestState.requesting;
        state.groupsAndSeats = [];
    },
    groupsAndSeatsSucceeded(state, list) {
        state.groupsAndSeatsState = RequestState.succeeded;
        state.groupsAndSeats = list.items;
    },
    groupsAndSeatsError(state, error) {
        state.groupsAndSeatsState = RequestState.failed;
        state.groupsAndSeatsError = error;
    },
    updateDeviceKeyRequesting(state, deviceId) {
        Vue.set(state.deviceStates, deviceId + "", RequestState.requesting);
        state.updatedDeviceKey = null;
    },
    updateDeviceKeySucceeded(state, data) {
        Vue.set(state.deviceStates, data.device.id + "", RequestState.succeeded);
        state.updatedDeviceKey = data;
    },
    updateDeviceKeyFailed(state, deviceId, error) {
        Vue.set(state.deviceStates, deviceId + "", RequestState.failed);
        Vue.set(state.deviceErrors, deviceId + "", error);
        state.updatedDeviceKey = null;
    }
}
