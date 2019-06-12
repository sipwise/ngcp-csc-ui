'use strict';

import {
    i18n
} from '../i18n';
import {
    CreationState,
    RequestState
} from "./common";
import _ from "lodash";
import Vue from "vue";
import {
    getSeatList,
    createSeat,
    removeSeat,
    setSeatName,
    setSeatExtension,
    setSeatGroups,
    setSeatNumbers,
    setSeatSoundSet
} from "../api/pbx-seats";

export default {
    namespaced: true,
    state: {
        seatListState: RequestState.initiated,
        seatListVisibility: 'visible',
        seatListItems: [],
        seatListCurrentPage: 1,
        seatListLastPage: null,
        seatSelected: null,
        seatCreating: null,
        seatCreationState: CreationState.initiated,
        seatCreationError: null,
        seatUpdating: null,
        seatUpdatingField: null,
        seatUpdateState: RequestState.initiated,
        seatUpdateError: null,
        seatRemoving: null,
        seatRemovalState: RequestState.initiated,
        seatRemovalError: null,
        seatMapById: {},
        preferenceMapById: {}
    },
    getters: {
        isSeatListEmpty(state) {
            return state.seatListItems.length && state.seatListItems.length === 0;
        },
        isSeatListRequesting(state) {
            return state.seatListState === RequestState.requesting;
        },
        isSeatListPaginationActive(state, getters) {
            let requesting = !getters.isSeatListRequesting || getters.isSeatCreating ||
                getters.isSeatRemoving || getters.isSeatUpdating;
            return !getters.isSeatListEmpty && requesting && state.seatListLastPage > 1;
        },
        isSeatAddFormDisabled(state) {
            return state.seatCreationState === CreationState.initiated ||
                state.seatCreationState === CreationState.created;
        },
        isSeatCreating(state) {
            return state.seatCreationState === CreationState.creating;
        },
        isSeatExpanded(state) {
            return (id)=>{
                return state.seatSelected !== null && state.seatSelected.id === id;
            };
        },
        isSeatRemoving(state) {
            return state.seatRemovalState === RequestState.requesting;
        },
        isSeatUpdating(state) {
            return state.seatUpdateState === RequestState.requesting;
        },
        isSeatLoading(state, getters) {
            return (seatId)=>{
                return (getters.isSeatRemoving && state.seatRemoving.id === seatId) ||
                    (getters.isSeatUpdating && state.seatUpdating.id === seatId)
            };
        },
        getSoundSetBySeatId(state, getters, rootState, rootGetters) {
            return (seatId)=>{
                let prefs = state.preferenceMapById[seatId];
                let soundSetName = _.get(prefs, 'contract_sound_set', null);
                if(soundSetName !== null) {
                    return rootGetters['pbx/getSoundSetByName'](soundSetName);
                }
                return null;
            }
        },
        getSeatCreatingName(state) {
            return _.get(state, 'seatCreating.name', '');
        },
        getSeatUpdatingField(state) {
            return _.get(state, 'seatUpdatingField', '');
        },
        getSeatRemovingName(state) {
            return _.get(state, 'seatRemoving.display_name', '');
        },
        getSeatRemoveDialogMessage(state, getters) {
            if(state.seatRemoving !== null) {
                return i18n.t('pbxConfig.removeSeatText', {
                    seat: getters.getSeatRemovingName
                });
            }
            return '';
        },
        getSeatCreationToastMessage(state, getters) {
            return i18n.t('pbxConfig.toasts.addedSeatToast', {
                seat: getters.getSeatCreatingName
            });
        },
        getSeatUpdateToastMessage(state, getters) {
            return i18n.t('pbxConfig.toasts.changedFieldToast', {
                field: getters.getSeatUpdatingField
            });
        },
        getSeatRemovalToastMessage(state, getters) {
            return i18n.t('pbxConfig.toasts.removedSeatToast', {
                seat: getters.getSeatRemovingName
            });
        },
        getSeatOptions(state) {
            let options = [];
            state.seatListItems.forEach((seat)=>{
                options.push({
                    label: seat.display_name,
                    value: seat.id
                });
            });
            return options;
        },
        hasCallQueue(state) {
            return (seatId)=>{
                return _.get(state, 'preferenceMapById.' + seatId + '.cloud_pbx_callqueue', false);
            }
        }
    },
    mutations: {
        seatListItemsSucceeded(state, options) {
            state.seatListState = RequestState.succeeded;
            state.seatListCurrentPage = _.get(options, 'page', 1);
            state.seatListItems = _.get(options, 'seats.items', []);
            state.seatListLastPage = _.get(options, 'seats.lastPage', 1);
            state.seatMapById = {};
            state.seatListItems.forEach((seat)=>{
                Vue.set(state.seatMapById, seat.id, seat);
            });
            state.preferenceMapById = {};
            _.get(options, 'preferences.items', []).forEach((preference)=>{
                Vue.set(state.preferenceMapById, preference.id, preference);
            });
            state.seatListVisibility = 'visible';
        },
        seatListItemsRequesting(state, options) {
            state.seatListState = RequestState.requesting;
            let clearList = _.get(options, 'clearList', true);
            if(clearList) {
                state.seatListVisibility = 'hidden';
                state.seatListItems = [];
                state.seatMapById = {};
                state.preferenceMapById = {};
                state.seatListLastPage = null;
            }
            else {
                state.seatListVisibility = 'visible';
            }
        },
        seatListItemsFailed(state) {
            state.seatListState = RequestState.failed;
        },
        seatCreationRequesting(state, seat) {
            state.seatCreationState = CreationState.creating;
            state.seatCreating = seat;
        },
        seatCreationSucceeded(state) {
            state.seatCreationState = CreationState.created;
        },
        seatCreationFailed(state, err) {
            state.seatCreationState = CreationState.error;
            state.seatCreationError = err;
        },
        seatUpdateRequesting(state, options) {
            state.seatUpdating = state.seatMapById[options.seatId];
            state.seatUpdatingField = options.seatField;
            state.seatUpdateState = RequestState.requesting;
        },
        seatUpdateSucceeded(state, options) {
            state.seatUpdating = null;
            state.seatUpdateState = RequestState.succeeded;
            let seat = _.get(options, 'seat', null);
            let preferences = _.get(options, 'preferences', null);
            if(seat !== null && preferences !== null) {
                Vue.delete(state.seatMapById, seat.id);
                Vue.set(state.seatMapById, seat.id, seat);
                for(let i = 0; i < state.seatListItems.length; i++) {
                    if(state.seatListItems[i].id === seat.id) {
                        state.seatListItems[i] = seat;
                    }
                }
                Vue.delete(state.preferenceMapById, preferences.id);
                Vue.set(state.preferenceMapById, preferences.id, preferences);
                if(state.seatSelected !== null && state.seatSelected.id === options.seat.id) {
                    state.seatSelected = options.seat;
                }
            }
        },
        seatUpdateFailed(state, err) {
            state.seatUpdating = null;
            state.seatUpdateState = RequestState.failed;
            state.seatUpdateError = err;
        },
        seatRemovalRequesting(state, id) {
            state.seatRemovalState = RequestState.requesting;
            state.seatRemoving = state.seatMapById[id];
        },
        seatRemovalCanceled(state) {
            state.seatRemovalState = RequestState.initiated;
            state.seatRemoving = null;
        },
        seatRemovalSucceeded(state) {
            state.seatRemovalState = RequestState.succeeded;
        },
        seatRemovalFailed(state, err) {
            state.seatRemovalState = RequestState.failed;
            state.seatRemovalError = err;
        },
        expandSeat(state, seatId) {
            state.seatSelected = state.seatMapById[seatId];
        },
        collapseSeat(state) {
            state.seatSelected = null;
        },
        enableSeatAddForm(state) {
            state.seatCreationState = CreationState.input;
            state.seatSelected = null;
        },
        disableSeatAddForm(state) {
            state.seatCreationState = CreationState.initiated;
        }
    },
    actions: {
        loadSeatListItems(context, options) {
            return new Promise((resolve, reject)=>{
                let page = _.get(options, 'page', context.state.seatListCurrentPage);
                let clearList = _.get(options, 'clearList', true);
                context.commit('seatListItemsRequesting', {
                    clearList: clearList
                });
                getSeatList({
                    page: page
                }).then((seatList)=>{
                    context.commit('pbx/pilotSucceeded', seatList.pilot, {root:true});
                    context.commit('pbx/numbersSucceeded', seatList.numbers, {root:true});
                    context.commit('pbx/soundSetsSucceeded', seatList.soundSets, {root:true});
                    context.commit('pbx/groupsSucceeded', seatList.groups, {root:true});
                    context.commit('seatListItemsSucceeded', {
                        seats: seatList.seats,
                        preferences: seatList.preferences,
                        page: page
                    });
                    resolve();
                }).catch((err)=>{
                    context.commit('seatListItemsFailed', err.message);
                    reject(err);
                });
            });
        },
        createSeat(context, seatData) {
            context.commit('seatCreationRequesting', seatData);
            createSeat(seatData).then(() => {
                return context.dispatch('loadSeatListItems', {
                    page: 1,
                    clearList: false
                });
            }).then(() => {
                context.commit('seatCreationSucceeded');
            }).catch((err) => {
                context.commit('seatCreationFailed', err.message);
            });
        },
        removeSeat(context, options) {
            context.commit('seatRemovalRequesting', options.seatId);
            removeSeat(options.seatId).then(() => {
                return context.dispatch('loadSeatListItems', {
                    page: context.getters.seatListCurrentPage,
                    clearList: false
                });
            }).then(() => {
                context.commit('seatRemovalSucceeded');
            }).catch((err) => {
                context.commit('seatRemovalFailed', err.message);
            });
        },
        setSeatName(context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.t('pbxConfig.seatName')
            });
            setSeatName({
                seatId: options.seatId,
                seatName: options.seatName
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result);
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message);
            });
        },
        setSeatExtension(context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.t('pbxConfig.extension')
            });
            setSeatExtension({
                seatId: options.seatId,
                seatExtension: options.seatExtension
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result);
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message);
            });
        },
        setSeatGroups(context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.t('pbxConfig.groups')
            });
            setSeatGroups({
                seatId: options.seatId,
                groupIds: options.groupIds
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result);
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message);
            });
        },
        setSeatNumbers(context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.t('pbxConfig.aliasNumbers')
            });
            setSeatNumbers({
                seatId: options.seatId,
                pilotId: context.rootGetters['pbx/pilot'].id,
                assignedNumbers: options.assignedNumbers,
                unassignedNumbers: options.unassignedNumbers
            }).then((result)=>{
                if(options.assignedNumbers.length > 0) {
                    return context.dispatch('loadSeatListItems', {
                        clearList: false
                    });
                }
                else {
                    return Promise.resolve(result);
                }
            }).then((result)=>{
                context.commit('seatUpdateSucceeded', result);
            }).catch((err)=>{
                context.commit('seatUpdateFailed', err.message);
            });
        },
        setSeatSoundSet(context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.t('pbxConfig.soundSet')
            });
            setSeatSoundSet({
                seatId: options.seatId,
                soundSetId: options.soundSetId
            }).then((result)=>{
                context.commit('seatUpdateSucceeded', result);
            }).catch((err)=>{
                context.commit('seatUpdateFailed', err.message);
            });
        }
    }
};
