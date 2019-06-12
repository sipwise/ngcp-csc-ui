'use strict';

import {
    CreationState,
    RequestState
} from "./common";
import _ from "lodash";
import {
    getDeviceList,
    createDevice,
    removeDevice,
    setDeviceStationName,
    setDeviceIdentifier,
    setDeviceProfile,
    setDeviceKeys
} from "../api/pbx-devices";
import Vue from "vue";
import {
    i18n
} from "../i18n";

export default {
    namespaced: true,
    state: {
        deviceListState: RequestState.initiated,
        deviceListVisibility: 'visible',
        deviceListItems: [],
        deviceListCurrentPage: 1,
        deviceListLastPage: null,
        deviceSelected: null,
        deviceCreating: null,
        deviceCreationState: CreationState.initiated,
        deviceCreationError: null,
        deviceUpdating: null,
        deviceUpdatingField: null,
        deviceUpdateState: RequestState.initiated,
        deviceUpdateError: null,
        deviceRemoving: null,
        deviceRemovalState: RequestState.initiated,
        deviceRemovalError: null,
        deviceMapById: {}
    },
    getters: {
        isDeviceListEmpty(state) {
            return state.deviceListItems.length && state.deviceListItems.length === 0;
        },
        isDeviceListRequesting(state) {
            return state.deviceListState === RequestState.requesting;
        },
        isDeviceExpanded(state) {
            return (id)=>{
                return state.deviceSelected !== null && state.deviceSelected.id === id;
            };
        },
        isDeviceListPaginationActive(state, getters) {
            let requesting = !getters.isDeviceListRequesting || getters.isDeviceCreating ||
                getters.isDeviceRemoving || getters.isDeviceUpdating;
            return !getters.isDeviceListEmpty && requesting && state.deviceListLastPage > 1;
        },
        isDeviceAddFormDisabled(state) {
            return state.deviceCreationState === CreationState.initiated ||
                state.deviceCreationState === CreationState.created;
        },
        isDeviceCreating(state) {
            return state.deviceCreationState === CreationState.creating;
        },
        isDeviceRemoving(state) {
            return state.deviceRemovalState === RequestState.requesting;
        },
        isDeviceUpdating(state) {
            return state.deviceUpdateState === RequestState.requesting;
        },
        isDeviceLoading(state, getters) {
            return (deviceId)=>{
                return (getters.isDeviceUpdating && state.deviceUpdating.id === deviceId) ||
                    (getters.isDeviceRemoving && state.deviceRemoving.id === deviceId)
            };
        },
        getDeviceRemovingName(state) {
            return _.get(state, 'deviceRemoving.station_name', '');
        },
        getDeviceRemoveDialogMessage(state, getters) {
            if(getters.isDeviceRemoving) {
                return i18n.t('pbxConfig.removeDeviceText', {
                    device: getters.getDeviceRemovingName
                });
            }
            return '';
        },
    },
    mutations: {
        deviceListItemsRequesting(state, options) {
            let clearList = _.get(options, 'clearList', true);
            state.deviceListState = RequestState.requesting;
            state.deviceListLastPage = null;
            if(clearList) {
                state.deviceListVisibility = 'hidden';
                state.deviceListItems = [];
                state.deviceMap = {};
            }
            else {
                state.deviceListVisibility = 'visible';
            }
        },
        deviceListItemsSucceeded(state, options) {
            state.deviceListState = RequestState.succeeded;
            state.deviceListCurrentPage = _.get(options, 'page', 1);
            state.deviceListItems = _.get(options, 'devices.items', []);
            state.deviceListLastPage = _.get(options, 'devices.lastPage', 1);
            state.deviceMap = {};
            state.deviceListItems.forEach((device)=>{
                Vue.set(state.deviceMap, device.id, device);
            });
            state.deviceListVisibility = 'visible';
        },
        deviceListItemsFailed(state) {
            state.deviceListState = RequestState.failed;
        },
        deviceCreationRequesting(state, device) {
            state.deviceCreationState = CreationState.creating;
            state.deviceCreating = device;
        },
        deviceCreationSucceeded(state) {
            state.deviceCreationState = CreationState.created;
        },
        deviceCreationFailed(state, err) {
            state.deviceCreationState = CreationState.error;
            state.deviceCreationError = err;
        },
        deviceUpdateRequesting(state, options) {
            state.deviceUpdating = state.deviceMap[options.deviceId];
            state.deviceUpdatingField = options.deviceField;
            state.deviceUpdateState = RequestState.requesting;
        },
        deviceUpdateSucceeded(state, device) {
            state.deviceUpdateState = RequestState.succeeded;
            Vue.delete(state.deviceMap, device.id);
            Vue.set(state.deviceMap, device.id, device);
            for(let i = 0; i < state.deviceListItems.length; i++) {
                if(state.deviceListItems[i].id === device.id) {
                    state.deviceListItems[i] = device;
                }
            }
        },
        deviceUpdateFailed(state, err) {
            state.deviceUpdating = null;
            state.deviceUpdateState = RequestState.failed;
            state.deviceUpdateError = err;
        },
        deviceRemovalRequesting(state, id) {
            state.deviceRemovalState = RequestState.requesting;
            state.deviceRemoving = state.deviceMap[id];
        },
        deviceRemovalCanceled(state) {
            state.deviceRemovalState = RequestState.initiated;
            state.deviceRemoving = null;
        },
        deviceRemovalSucceeded(state) {
            state.deviceRemovalState = RequestState.succeeded;
        },
        deviceRemovalFailed(state, err) {
            state.deviceRemovalState = RequestState.failed;
            state.deviceRemovalError = err;
        },
        expandDevice(state, deviceId) {
            state.deviceSelected = state.deviceMap[deviceId];
        },
        collapseDevice(state) {
            state.deviceSelected = null;
        },
        enableDeviceAddForm(state) {
            state.deviceCreationState = CreationState.input;
            state.deviceSelected = null;
        },
        disableDeviceAddForm(state) {
            state.deviceCreationState = CreationState.initiated;
        }
    },
    actions: {
        loadDeviceListItems(context, options) {
            return new Promise((resolve, reject)=> {
                let page = _.get(options, 'page', context.state.deviceListCurrentPage);
                let clearList = _.get(options, 'clearList', true);
                let stationNameFilter = _.get(options, 'stationNameFilter', null);
                let identifierFilter = _.get(options, 'identifierFilter', null);
                let profileFilter = _.get(options, 'profileFilter', null);
                context.commit('deviceListItemsRequesting', {
                    clearList: clearList
                });
                Promise.resolve().then(() => {
                    return context.dispatch('pbx/loadProfiles', null, {root:true});
                }).then(() => {
                    return getDeviceList({
                        page: page,
                        station_name: stationNameFilter,
                        identifier: identifierFilter,
                        profile_id: profileFilter
                    });
                }).then((devices) => {
                    context.commit('deviceListItemsSucceeded', {
                        devices: devices,
                        page: page
                    });
                    resolve();
                }).catch((err) => {
                    context.commit('deviceListItemsFailed', err.message);
                    reject(err);
                });
            })
        },
        createDevice(context, deviceData) {
            context.commit('deviceCreationRequesting', deviceData);
            createDevice(deviceData).then(() => {
                return context.dispatch('loadDeviceListItems', {
                    page: 1,
                    clearList: false
                });
            }).then(() => {
                context.commit('deviceCreationSucceeded');
            }).catch((err) => {
                context.commit('deviceCreationFailed', err.message);
            });
        },
        removeDevice(context, deviceId) {
            context.commit('deviceRemovalRequesting', deviceId);
            removeDevice(deviceId).then(() => {
                return context.dispatch('loadDeviceListItems', {
                    page: context.state.deviceListCurrentPage,
                    clearList: false
                });
            }).then(() => {
                context.commit('deviceRemovalSucceeded');
            }).catch((err) => {
                context.commit('deviceRemovalFailed', err.message);
            });
        },
        setDeviceStationName(context, options) {
            context.commit('deviceUpdateRequesting', {
                deviceId: options.deviceId,
                deviceField: 'Station name'
            });
            setDeviceStationName(options.deviceId, options.stationName).then((device) => {
                context.commit('deviceUpdateSucceeded', device);
            }).catch((err) => {
                context.commit('deviceUpdateFailed', err.message);
            });
        },
        setDeviceIdentifier(context, options) {
            context.commit('deviceUpdateRequesting', {
                deviceId: options.deviceId,
                deviceField: 'Identifier'
            });
            setDeviceIdentifier(options.deviceId, options.identifier).then((device) => {
                context.commit('deviceUpdateSucceeded', device);
            }).catch((err) => {
                context.commit('deviceUpdateFailed', err.message);
            });
        },
        setDeviceProfile(context, options) {
            context.commit('deviceUpdateRequesting', {
                deviceId: options.deviceId,
                deviceField: 'Profile'
            });
            setDeviceProfile(options.deviceId, options.profileId).then((device) => {
                context.commit('deviceUpdateSucceeded', device);
            }).catch((err) => {
                context.commit('deviceUpdateFailed', err.message);
            });
        },
        setDeviceKeys(context, options) {
            context.commit('deviceUpdateRequesting', {
                deviceId: options.deviceId,
                deviceField: 'Keys'
            });
            setDeviceKeys(options.deviceId, options.keys).then((device) => {
                context.commit('deviceUpdateSucceeded', device);
            }).catch((err) => {
                context.commit('deviceUpdateFailed', err.message);
            });
        },
    }
};
