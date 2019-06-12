'use strict';

import Vue from 'vue'
import _ from 'lodash'
import {
    CreationState,
    RequestState
} from "./common";
import {
    getCallQueueList,
    createCallQueue,
    removeCallQueue,
    setCallQueueMaxLength,
    setCallQueueWrapUpTime
} from "../api/pbx-callqueues";
import {i18n} from "../i18n";

export default {
    namespaced: true,
    state: {
        callQueueListState: RequestState.initiated,
        callQueueListVisible: true,
        callQueueList: [],
        callQueueMap: {},
        callQueueSelected: null,
        callQueueCreationState: CreationState.initiated,
        callQueueCreationData: null,
        callQueueUpdateState: RequestState.initiated,
        callQueueUpdating: null,
        callQueueRemovalState: RequestState.initiated,
        callQueueRemoving: null,
        subscriberMap: {},
        defaultMaxQueueLength: 5,
        defaultQueueWrapUpTime: 10
    },
    getters: {
        isCallQueueListRequesting(state) {
            return state.callQueueListState === RequestState.requesting;
        },
        isCallQueueAddFormEnabled(state) {
            return state.callQueueCreationState !== CreationState.initiated &&
                state.callQueueCreationState !== CreationState.created;
        },
        isCallQueueCreating(state) {
            return state.callQueueCreationState === CreationState.creating;
        },
        isCallQueueUpdating(state) {
            return state.callQueueUpdateState === RequestState.requesting;
        },
        isCallQueueRemoving(state) {
            return state.callQueueRemoving === RequestState.requesting;
        },
        isCallQueueLoading(state) {
            return (id)=>{
                return (state.callQueueRemovalState === RequestState.requesting &&
                    state.callQueueRemoving !== null && state.callQueueRemoving.id === id) ||
                    (state.callQueueUpdateState === RequestState.requesting &&
                    state.callQueueUpdating !== null && state.callQueueUpdating.id === id);
            };
        },
        isCallQueueExpanded(state) {
            return (id)=>{
                return state.callQueueSelected !== null && state.callQueueSelected.id === id;
            };
        },
        getCallQueueRemoveDialogMessage(state) {
            if(state.callQueueRemoving !== null) {
                return i18n.t('pbxConfig.callQueueRemovalDialogText', {
                    subscriber: state.subscriberMap[state.callQueueRemoving.id].display_name
                });
            }
            return '';
        }
    },
    mutations: {
        callQueueListRequesting(state, options) {
            state.callQueueListState = RequestState.requesting;
            if(!options.listVisible) {
                state.callQueueList = [];
                state.callQueueMap = {};
                state.callQueueListVisible = false;
            }
            else {
                state.callQueueListVisible = true;
            }
        },
        callQueueListSucceeded(state, callQueueList) {
            state.callQueueListState = RequestState.succeeded;
            state.callQueueList = _.get(callQueueList, 'callQueues.items', []);
            state.callQueueList.forEach((callQueue) => {
                Vue.set(state.callQueueMap, callQueue.id, callQueue);
            });
            _.get(callQueueList, 'subscribers.items', []).forEach((subscriber) => {
                Vue.set(state.subscriberMap, subscriber.id, subscriber);
            });
            state.callQueueListVisible = true;
        },
        callQueueCreationRequesting(state) {
            state.callQueueCreationState = CreationState.creating;
        },
        callQueueCreationSucceeded(state) {
            state.callQueueCreationState = CreationState.created;
        },
        callQueueCreationFailed(state) {
            state.callQueueCreationState = CreationState.error;
        },
        callQueueRemovalRequesting(state, callQueueId) {
            state.callQueueRemovalState = RequestState.requesting;
            if(callQueueId) {
                state.callQueueRemoving = state.callQueueMap[callQueueId];
            }
        },
        callQueueRemovalCanceled(state) {
            state.callQueueRemovalState = RequestState.initiated;
            state.callQueueRemoving = null;
        },
        callQueueRemovalSucceeded(state) {
            state.callQueueRemovalState = RequestState.succeeded;
        },
        callQueueRemovalFailed(state) {
            state.callQueueRemovalState = RequestState.failed;
        },
        callQueueUpdateRequesting(state, options) {
            state.callQueueUpdateState = RequestState.requesting;
            state.callQueueUpdating = state.callQueueMap[options.callQueueId];
        },
        callQueueUpdateSucceeded(state, preferences) {
            state.callQueueUpdateState = RequestState.succeeded;
            if(preferences) {
                for(let i = 0; i < state.callQueueList.length; i++) {
                    if(state.callQueueList[i].id === preferences.id) {
                        state.callQueueList[i] = preferences;
                    }
                }
                Vue.delete(state.callQueueMap, preferences.id);
                Vue.set(state.callQueueMap, preferences.id, preferences);
            }
        },
        callQueueUpdateFailed(state) {
            state.callQueueUpdateState = RequestState.failed;
        },
        enableCallQueueAddForm(state) {
            state.callQueueCreationState = CreationState.input;
        },
        disableCallQueueAddForm(state) {
            state.callQueueCreationState = CreationState.initiated;
        },
        expandCallQueue(state, callQueueId) {
            state.callQueueSelected = state.callQueueMap[callQueueId];
        },
        collapseCallQueue(state) {
            state.callQueueSelected = null;
        }
    },
    actions: {
        loadCallQueueList(context, options) {
            let listVisible = _.get(options, 'listVisible', false);
            let selectedId = _.get(options, 'selectedId', null);
            return new Promise((resolve)=>{
                context.commit('callQueueListRequesting', {
                    listVisible: listVisible
                });
                getCallQueueList().then((callQueueList)=>{
                    context.commit('callQueueListSucceeded', callQueueList);
                    if(selectedId !== null) {
                        context.commit('expandCallQueue', callQueueList);
                        context.commit('highlightCallQueue', callQueueList);
                    }
                    resolve();
                }).catch(()=>{
                    resolve();
                    context.commit('callQueueListSucceeded');
                });
            });
        },
        createCallQueue(context, callQueueData) {
            context.commit('callQueueCreationRequesting', callQueueData);
            createCallQueue(callQueueData).then(()=>{
                return context.dispatch('loadCallQueueList',{
                    listVisible: true
                });
            }).then(()=>{
                context.commit('callQueueCreationSucceeded');
            }).catch(()=>{
                context.commit('callQueueCreationFailed');
            });
        },
        removeCallQueue(context) {
            context.commit('callQueueRemovalRequesting');
            removeCallQueue(context.state.callQueueRemoving.id).then(()=>{
                return context.dispatch('loadCallQueueList',{
                    listVisible: true
                });
            }).then(()=>{
                context.commit('callQueueRemovalSucceeded');
            }).catch((err)=>{
                context.commit('callQueueRemovalFailed', err.message);
            });
        },
        setCallQueueMaxLength(context, options) {
            context.commit('callQueueUpdateRequesting', {
                callQueueId: options.callQueueId,
                callQueueUpdatingField: 'maxLength'
            });
            setCallQueueMaxLength(options).then((preferences)=>{
                context.commit('callQueueUpdateSucceeded', preferences);
            }).catch((err)=>{
                context.commit('callQueueUpdateFailed', err.message);
            });
        },
        setCallQueueWrapUpTime(context, options) {
            context.commit('callQueueUpdateRequesting', {
                callQueueId: options.callQueueId,
                callQueueUpdatingField: 'wrapUpTime'
            });
            setCallQueueWrapUpTime(options).then((preferences)=>{
                context.commit('callQueueUpdateSucceeded', preferences);
            }).catch((err)=>{
                context.commit('callQueueUpdateFailed', err.message);
            });
        }
    }
};
