'use strict';

import Vue from 'vue'
import _ from 'lodash'
import { RequestState } from '../common'
import { reactiveSet } from '../../helpers/store-helper'

function updateDevicePropertyRequesting(state, deviceId, property) {
    state.updatedDevice = deviceId;
    state.updatedDeviceState = RequestState.requesting;
    state.updatedDeviceError = null;
    state.updatedDeviceProperty = property;
}

function updateDevicePropertySucceeded(state) {
    state.updatedDeviceState = RequestState.succeeded;
    state.updatedDeviceError = null;
}

function updateDevicePropertyFailed(state, error) {
    state.updatedDeviceState = RequestState.failed;
    state.updatedDeviceError = error;
}

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
        state.listLastPage = null;
        state.listLoadingSilently = _.get(options, 'silent', false);
        state.listState = RequestState.requesting;
        state.listError = null;
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
        if (data.length === 0) {
            state.filterByMacAddress = null;
            state.filterByProfile = null;
        }
    },
    deviceListFailed(state, error) {
        state.listState = RequestState.failed;
        state.listError = error;
    },
    deviceRequesting(state, deviceId) {
        reactiveSet(state.deviceStates, deviceId + "", RequestState.requesting);
    },
    deviceSucceeded(state, device) {
        let deviceId = device.id + "";
        reactiveSet(state.deviceStates, deviceId, RequestState.succeeded);
        reactiveSet(state.deviceErrors, deviceId, null);
        reactiveSet(state.devices, deviceId, device);
        for(let i = 0; i <= state.devicesOrdered.length; i++) {
            if(state.devicesOrdered[i].id === device.id) {
                state.devicesOrdered[i] = device;
            }
        }
    },
    deviceFailed(state, deviceId, error) {
        deviceId = deviceId + "";
        reactiveSet(state.deviceStates, deviceId, RequestState.failed);
        reactiveSet(state.deviceErrors, deviceId, error);
    },
    deviceRemoved(state, device) {
        let deviceId = device.id + "";
        reactiveSet(state.deviceStates, deviceId, 'deleted');
        reactiveSet(state.deviceErrors, deviceId, null);
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
    profilesRequesting(state) {
        state.profilesRequesting = true;
        state.profilesRequestError = null;
    },
    profilesSucceeded(state, profiles) {
        state.profilesOrdered = profiles.items;
        state.profilesOrdered.forEach((profile)=>{
            state.profiles[profile.id  + ""] = profile;
        });
        state.profilesRequesting = false;
        state.profilesRequestError = null;
    },
    profilesFailed(state, error) {
        state.profilesRequesting = false;
        state.profilesRequestError = error;
    },
    modelImageRequesting(state, modelId) {
        reactiveSet(state.modelImageStates, modelId, RequestState.requesting);
    },
    modelImageSucceeded(state, modelImage) {
        reactiveSet(state.modelImageStates, modelImage.id, RequestState.succeeded);
        reactiveSet(state.modelImageErrors, modelImage.id, null);
        reactiveSet(state.modelImages, modelImage.id, modelImage);
    },
    modelImageFailed(state, modelId, error) {
        reactiveSet(state.modelImageStates, modelId, RequestState.succeeded);
        reactiveSet(state.modelImageErrors, modelId, error);
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
    },
    createDeviceRequesting(state, device) {
        state.createDeviceState = RequestState.requesting;
        state.createDeviceItem = device;
        state.createDeviceError = null;
    },
    createDeviceSucceeded(state) {
        state.createDeviceState = RequestState.succeeded;
    },
    createDeviceFailed(state, error) {
        state.createDeviceState = RequestState.failed;
        state.createDeviceError = error;
    },
    listProfilesRequesting(state) {
        state.listProfilesState = RequestState.requesting;
        state.listProfilesError = null;
    },
    listProfilesSucceeded(state, profiles) {
        state.listProfilesState = RequestState.succeeded;
        state.listProfilesError = null;
        state.profiles = profiles;
        profiles.items.forEach((profile)=>{
            state.profiles[profile.id] = profile;
            state.profilesOrdered.push(profile);
        });
    },
    listProfilesFailed(state, error) {
        state.listProfilesState = RequestState.failed;
        state.listProfilesError = error;
    },
    updateStationNameRequesting(state, deviceId) {
        updateDevicePropertyRequesting(state, deviceId, 'station_name');
    },
    updateStationNameSucceeded(state) {
        updateDevicePropertySucceeded(state);
    },
    updateStationNameFailed(state, error) {
        updateDevicePropertyFailed(state, error);
    },
    updateIdentifierRequesting(state, deviceId) {
        updateDevicePropertyRequesting(state, deviceId, 'identifier');
    },
    updateIdentifierSucceeded(state) {
        updateDevicePropertySucceeded(state);
    },
    updateIdentifierFailed(state, error) {
        updateDevicePropertyFailed(state, error);
    },
    updateProfileRequesting(state, deviceId) {
        updateDevicePropertyRequesting(state, deviceId, 'profile_id');
    },
    updateProfileSucceeded(state) {
        updateDevicePropertySucceeded(state);
    },
    updateProfileFailed(state, error) {
        updateDevicePropertyFailed(state, error);
    },
    filterByProfile(state, profile) {
        state.listProfileFilter = profile.id;
        state.listCurrentPage = 1;
        state.chipModelFilter = profile.name;
    },
    filterByMacAddress(state, macAddress) {
        state.listMacAddressFilter = macAddress;
        state.listCurrentPage = 1;
        state.chipMacAddressFilter = macAddress;
    },
    resetProfileFilter(state) {
        state.listProfileFilter = null;
        state.chipModelFilter = null;
    },
    resetMacAddressFilter(state) {
        state.listMacAddressFilter = null;
        state.chipMacAddressFilter = null;
    },
    goToPage(state, page) {
        state.listCurrentPage = page;
    },
    groupReloading(state, group) {
        state.groupReloadingState = RequestState.requesting;
        state.groupReloadingError = null;
        state.groupReloading = group;
    },
    groupReloaded(state, group) {
        state.groupReloadingState = RequestState.succeeded;
        state.groupReloadingError = null;
        Vue.set(state.groups, group.id, group);
        for(let i = 0; i < state.groupsOrdered.length; i++) {
            if(state.groupsOrdered[i].id === group.id) {
                state.groupsOrdered[i] = group;
            }
        }
        let seatIds = _.get(group, 'pbx_groupmember_ids', []);
        group.seats = [];
        seatIds.forEach((seatId)=>{
            group.seats.push(state.seats[seatId]);
        });
    },
    groupReloadingFailed(state, err) {
        state.groupReloadingState = RequestState.failed;
        state.groupReloadingError = err;
    },
    seatReloading(state, seat) {
        state.seatReloadingState = RequestState.requesting;
        state.seatReloadingError = null;
        state.seatReloading = seat;
    },
    seatReloaded(state, seat) {
        state.seatReloadingState = RequestState.succeeded;
        state.seatReloadingError = null;
        Vue.set(state.seats, seat.id, seat);
        for(let i = 0; i < state.seatsOrdered.length; i++) {
            if(state.seatsOrdered[i].id === seat.id) {
                state.seatsOrdered[i] = seat;
            }
        }
        let groupIds = _.get(seat, 'pbx_group_ids', []);
        seat.groups = [];
        groupIds.forEach((groupId)=>{
            seat.groups.push(state.groups[groupId]);
        });
    },
    seatReloadingFailed(state, err) {
        state.seatReloadingState = RequestState.failed;
        state.seatReloadingError = err;
    }
}
