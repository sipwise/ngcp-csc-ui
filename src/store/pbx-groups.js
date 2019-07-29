'use strict';

import {
    CreationState,
    RequestState
} from "./common";
import {
    getGroupList,
    createGroup,
    removeGroup,
    setGroupName,
    setGroupExtension,
    setGroupHuntPolicy,
    setGroupHuntTimeout,
    setGroupNumbers,
    setGroupSeats,
    setGroupSoundSet
} from "../api/pbx-groups";
import _ from "lodash";
import {
    i18n
} from "../i18n";
import Vue from "vue";

export default {
    namespaced: true,
    state: {
        groupListState: RequestState.initiated,
        groupListVisibility: 'visible',
        groupListItems: [],
        groupListCurrentPage: 1,
        groupListLastPage: null,
        groupSelected: null,
        groupCreating: null,
        groupCreationState: CreationState.initiated,
        groupCreationError: null,
        groupUpdating: null,
        groupUpdatingField: null,
        groupUpdateState: RequestState.initiated,
        groupUpdateError: null,
        groupRemoving: null,
        groupRemovalState: RequestState.initiated,
        groupRemovalError: null,
        groupMapById: {},
        preferenceMapById: {}
    },
    getters: {
        isGroupListEmpty(state) {
            return Array.isArray(state.groupListItems) && state.groupListItems.length === 0;
        },
        isGroupListRequesting(state) {
            return state.groupListState === RequestState.requesting;
        },
        isGroupListPaginationActive(state, getters) {
            let requesting = !getters.isGroupListRequesting || getters.isGroupCreating ||
                getters.isGroupRemoving || getters.isGroupUpdating;
            return !getters.isGroupListEmpty && requesting && state.groupListLastPage > 1;
        },
        isGroupAddFormDisabled(state) {
            return state.groupCreationState === CreationState.initiated ||
                state.groupCreationState === CreationState.created;
        },
        isGroupCreating(state) {
            return state.groupCreationState === CreationState.creating;
        },
        isGroupRemoving(state) {
            return state.groupRemovalState === RequestState.requesting;
        },
        isGroupUpdating(state) {
            return state.groupUpdateState === RequestState.requesting;
        },
        isGroupExpanded(state) {
            return (groupId)=>{
                return state.groupSelected !== null && state.groupSelected.id === groupId;
            };
        },
        isGroupLoading(state, getters) {
            return (groupId)=>{
                return (getters.isGroupRemoving && state.groupRemoving.id === groupId) ||
                    (getters.isGroupUpdating && state.groupUpdating.id === groupId)
            };
        },
        getSoundSetByGroupId(state, getters, rootState, rootGetters) {
            return (groupId)=>{
                let prefs = state.preferenceMapById[groupId];
                let soundSetName = _.get(prefs, 'contract_sound_set', null);
                if(soundSetName !== null) {
                    return rootGetters['pbx/getSoundSetByName'](soundSetName);
                }
                return null;
            }
        },
        getGroupCreatingName(state) {
            return _.get(state, 'groupCreating.name', '');
        },
        getGroupUpdatingField(state) {
            return _.get(state, 'groupUpdatingField', '');
        },
        getGroupRemovingName(state) {
            return _.get(state, 'groupRemoving.display_name', '');
        },
        getGroupRemoveDialogMessage(state, getters) {
            if(getters.isGroupRemoving) {
                return i18n.t('pbxConfig.removeGroupText', {
                    group: getters.getGroupRemovingName
                });
            }
            return '';
        },
        getGroupCreationToastMessage(state, getters) {
            return i18n.t('pbxConfig.toasts.addedGroupToast', {
                group: getters.getGroupCreatingName
            });
        },
        getGroupUpdateToastMessage(state, getters) {
            return i18n.t('pbxConfig.toasts.changedFieldToast', {
                field: getters.getGroupUpdatingField
            });
        },
        getGroupRemovalToastMessage(state, getters) {
            return i18n.t('pbxConfig.toasts.removedGroupToast', {
                group: getters.getGroupRemovingName
            });
        },
        getGroupOptions(state) {
            let options = [];
            state.groupListItems.forEach((group)=>{
                options.push({
                    label: group.display_name,
                    value: group.id
                });
            });
            return options;
        },
        getHuntPolicyOptions() {
            return [
                {
                    label: i18n.t('pbxConfig.serialRinging'),
                    value: 'serial'
                },
                {
                    label: i18n.t('pbxConfig.parallelRinging'),
                    value: 'parallel'
                },
                {
                    label: i18n.t('pbxConfig.randomRinging'),
                    value: 'random'
                },
                {
                    label: i18n.t('pbxConfig.circularRinging'),
                    value: 'circular'
                }
            ];
        },
        hasCallQueue(state) {
            return (groupId)=>{
                return _.get(state, 'preferenceMapById.' + groupId + '.cloud_pbx_callqueue', false);
            }
        }
    },
    mutations: {
        groupListItemsSucceeded(state, options) {
            state.groupListState = RequestState.succeeded;
            state.groupListCurrentPage = _.get(options, 'page', 1);
            state.groupListItems = _.get(options, 'groups.items', []);
            state.groupListLastPage = _.get(options, 'groups.lastPage', 1);
            state.groupMapById = {};
            state.groupListItems.forEach((group)=>{
                state.groupMapById[group.id] = group;
            });
            let preferences = _.get(options, 'preferences.items', []);
            preferences.forEach((preference)=>{
                Vue.set(state.preferenceMapById, preference.id, preference);
            });
            state.groupListVisibility = 'visible';
        },
        groupListItemsRequesting(state, options) {
            let clearList = _.get(options, 'clearList', true);
            state.groupListState = RequestState.requesting;
            state.groupListLastPage = null;
            if(clearList) {
                state.groupListVisibility = 'hidden';
                state.groupListItems = [];
                state.groupMapById = {};
                state.preferenceMapById = {};
            }
            else {
                state.groupListVisibility = 'visible';
            }
        },
        groupListItemsFailed(state) {
            state.groupListState = RequestState.failed;
        },
        groupCreationRequesting(state, group) {
            state.groupCreationState = CreationState.creating;
            state.groupCreating = group;
        },
        groupCreationSucceeded(state) {
            state.groupCreationState = CreationState.created;
        },
        groupCreationFailed(state, err) {
            state.groupCreationState = CreationState.error;
            state.groupCreationError = err;
        },
        groupUpdateRequesting(state, options) {
            state.groupUpdating = state.groupMapById[options.groupId];
            state.groupUpdatingField = options.groupField;
            state.groupUpdateState = RequestState.requesting;
        },
        groupUpdateSucceeded(state, options) {
            state.groupUpdating = null;
            state.groupUpdateState = RequestState.succeeded;
            let group = _.get(options, 'group', null);
            let preferences = _.get(options, 'preferences', null);
            if(group !== null && preferences !== null) {
                Vue.delete(state.groupMapById, group.id);
                Vue.set(state.groupMapById, group.id, group);
                for(let i = 0; i < state.groupListItems.length; i++) {
                    if(state.groupListItems[i].id === group.id) {
                        state.groupListItems[i] = group;
                    }
                }
                Vue.delete(state.preferenceMapById, preferences.id);
                Vue.set(state.preferenceMapById, preferences.id, preferences);
                if(state.groupSelected !== null && state.groupSelected.id === options.group.id) {
                    state.groupSelected = options.group;
                }
            }
        },
        groupUpdateFailed(state, err) {
            state.groupUpdating = null;
            state.groupUpdateState = RequestState.failed;
            state.groupUpdateError = err;
        },
        groupRemovalRequesting(state, id) {
            state.groupRemovalState = RequestState.requesting;
            state.groupRemoving = state.groupMapById[id];
        },
        groupRemovalCanceled(state) {
            state.groupRemovalState = RequestState.initiated;
            state.groupRemoving = null;
        },
        groupRemovalSucceeded(state) {
            state.groupRemovalState = RequestState.succeeded;
        },
        groupRemovalFailed(state, err) {
            state.groupRemovalState = RequestState.failed;
            state.groupRemovalError = err;
        },
        expandGroup(state, groupId) {
            state.groupSelected = state.groupMapById[groupId];
        },
        collapseGroup(state) {
            state.groupSelected = null;
        },
        enableGroupAddForm(state) {
            state.groupCreationState = CreationState.input;
            state.groupSelected = null;
        },
        disableGroupAddForm(state) {
            state.groupCreationState = CreationState.initiated;
        }
    },
    actions: {
        loadGroupListItems(context, options) {
            return new Promise((resolve, reject)=>{
                let page = _.get(options, 'page', context.state.groupListCurrentPage);
                let clearList = _.get(options, 'clearList', true);
                context.commit('groupListItemsRequesting', {
                    clearList: clearList
                });
                getGroupList({
                    page: page
                }).then((groupList)=>{
                    context.commit('pbx/pilotSucceeded', groupList.pilot, {root:true});
                    context.commit('pbx/numbersSucceeded', groupList.numbers, {root:true});
                    context.commit('pbx/soundSetsSucceeded', groupList.soundSets, {root:true});
                    context.commit('pbx/seatsSucceeded', groupList.seats, {root:true});
                    context.commit('groupListItemsSucceeded', {
                        groups: groupList.groups,
                        preferences: groupList.preferences,
                        page: page
                    });
                    resolve();
                }).catch((err)=>{
                    context.commit('groupListItemsFailed', err.message);
                    reject(err);
                });
            });
        },
        createGroup(context, groupData) {
            context.commit('groupCreationRequesting', groupData);
            createGroup(groupData).then(() => {
                return context.dispatch('loadGroupListItems', {
                    page: 1,
                    clearList: false
                });
            }).then(() => {
                context.commit('groupCreationSucceeded');
            }).catch((err) => {
                context.commit('groupCreationFailed', err.message);
            });
        },
        removeGroup(context, options) {
            context.commit('groupRemovalRequesting', options.groupId);
            removeGroup(options.groupId).then(() => {
                return context.dispatch('loadGroupListItems', {
                    page: context.state.groupListCurrentPage,
                    clearList: false
                });
            }).then(() => {
                context.commit('groupRemovalSucceeded');
            }).catch((err) => {
                context.commit('groupRemovalFailed', err.message);
            });
        },
        setGroupName(context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.t('pbxConfig.groupName')
            });
            setGroupName({
                groupId: options.groupId,
                groupName: options.groupName
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result);
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message);
            });
        },
        setGroupExtension(context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.t('pbxConfig.extension')
            });
            setGroupExtension({
                groupId: options.groupId,
                groupExtension: options.groupExtension
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result);
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message);
            });
        },
        setGroupHuntPolicy(context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.t('pbxConfig.huntPolicy')
            });
            setGroupHuntPolicy({
                groupId: options.groupId,
                groupHuntPolicy: options.groupHuntPolicy
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result);
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message);
            });
        },
        setGroupHuntTimeout(context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.t('pbxConfig.huntPolicy')
            });
            setGroupHuntTimeout({
                groupId: options.groupId,
                groupHuntTimeout: options.groupHuntTimeout
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result);
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message);
            });
        },
        setGroupNumbers(context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.t('pbxConfig.aliasNumbers')
            });
            setGroupNumbers({
                groupId: options.groupId,
                pilotId: context.rootGetters['pbx/pilot'].id,
                assignedNumbers: options.assignedNumbers,
                unassignedNumbers: options.unassignedNumbers
            }).then((result)=>{
                if(options.assignedNumbers.length > 0) {
                    return context.dispatch('loadGroupListItems', {
                        clearList: false
                    });
                }
                else {
                    return Promise.resolve(result);
                }
            }).then((result)=>{
                context.commit('groupUpdateSucceeded', result);
            }).catch((err)=>{
                context.commit('groupUpdateFailed', err.message);
            });
        },
        setGroupSeats(context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.t('pbxConfig.seats')
            });
            setGroupSeats({
                groupId: options.groupId,
                seatIds: options.seatIds
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result);
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message);
            });
        },
        setGroupSoundSet(context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.t('pbxConfig.soundSet')
            });
            setGroupSoundSet({
                groupId: options.groupId,
                soundSetId: options.soundSetId
            }).then((result)=>{
                context.commit('groupUpdateSucceeded', result);
            }).catch((err)=>{
                context.commit('groupUpdateFailed', err.message);
            });
        }
    }
};
