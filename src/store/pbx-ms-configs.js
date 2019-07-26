'use strict';

import {
    router
} from '../router'
import Vue from 'vue'
import _ from 'lodash'
import {
    CreationState,
    RequestState
} from "./common";
import {
    getMsConfigList,
    createMsConfig,
    removeMsConfig,
    setSecretaryNumber
} from "../api/pbx-ms-configs";
import {
    i18n
} from "../i18n";

export default {
    namespaced: true,
    state: {
        msConfigListState: RequestState.initiated,
        msConfigListVisible: true,
        msConfigList: [],
        msConfigMap: {},
        msConfigSelected: null,
        msConfigCreationState: CreationState.initiated,
        msConfigCreationData: null,
        msConfigCreationError: null,
        msConfigUpdateState: RequestState.initiated,
        msConfigUpdating: null,
        msConfigUpdatingField: null,
        msConfigUpdateError: null,
        msConfigRemovalState: RequestState.initiated,
        msConfigRemoving: null,
        msConfigRemovalError: null,
        subscriberMap: {}
    },
    getters: {
        isMsConfigListRequesting(state) {
            return state.msConfigListState === RequestState.requesting;
        },
        isMsConfigAddFormEnabled(state) {
            return state.msConfigCreationState !== CreationState.initiated &&
                state.msConfigCreationState !== CreationState.created;
        },
        isMsConfigCreating(state) {
            return state.msConfigCreationState === CreationState.creating;
        },
        isMsConfigUpdating(state) {
            return state.msConfigUpdateState === RequestState.requesting;
        },
        isMsConfigRemoving(state) {
            return state.msConfigRemoving === RequestState.requesting;
        },
        isMsConfigLoading(state) {
            return (id)=>{
                return (state.msConfigRemovalState === RequestState.requesting &&
                    state.msConfigRemoving !== null && state.msConfigRemoving.id === id) ||
                    (state.msConfigUpdateState === RequestState.requesting &&
                    state.msConfigUpdating !== null && state.msConfigUpdating.id === id);
            };
        },
        isMsConfigExpanded(state) {
            return (id)=>{
                return state.msConfigSelected !== null && state.msConfigSelected.id === id;
            };
        },
        getMsConfigRemoveDialogMessage(state) {
            if(state.msConfigRemoving !== null) {
                return i18n.t('pbxConfig.msConfigRemovalDialogText', {
                    msConfig: state.subscriberMap[state.msConfigRemoving.id].display_name
                });
            }
            return '';
        },
        getMsConfigRemovingName(state) {
            let subscriber = _.get(state.subscriberMap, _.get(state.msConfigRemoving, 'id', null), null);
            return _.get(subscriber, 'display_name', '');
        },
        getMsConfigCreatingName(state) {
            let subscriber = _.get(state.subscriberMap, _.get(state.msConfigCreationData, 'subscriberId', null), null);
            return _.get(subscriber, 'display_name', '');
        },
        getMsConfigUpdatingName(state) {
            let subscriber = _.get(state.subscriberMap, _.get(state.msConfigUpdating, 'id', null), null);
            return _.get(subscriber, 'display_name', '');
        },
        getMsConfigUpdatingField(state) {
            return state.msConfigUpdatingField;
        },
        getMsConfigRemovalDialogMessage(state, getters) {
            if(getters.isMsConfigRemoving) {
                return i18n.t('pbxConfig.msConfigRemovalDialogMessage', {
                    msConfig: getters.getMsConfigRemovingName
                });
            }
            return '';
        },
        getMsConfigCreationToastMessage(state, getters) {
            return i18n.t('pbxConfig.msConfigCreationToast', {
                msConfig: getters.getMsConfigCreatingName
            });
        },
        getMsConfigUpdateToastMessage(state, getters) {
            return i18n.t('pbxConfig.msConfigUpdateToast', {
                msConfig: getters.getMsConfigUpdatingName,
                field: getters.getMsConfigUpdatingField
            });
        },
        getMsConfigRemovalToastMessage(state, getters) {
            return i18n.t('pbxConfig.msConfigRemovalToast', {
                msConfig: getters.getMsConfigRemovingName
            });
        }
    },
    mutations: {
        msConfigListRequesting(state, options) {
            state.msConfigListState = RequestState.requesting;
            if(!options.listVisible) {
                state.msConfigList = [];
                state.msConfigMap = {};
                state.msConfigListVisible = false;
            }
            else {
                state.msConfigListVisible = true;
            }
        },
        msConfigListSucceeded(state, msConfigList) {
            state.msConfigListState = RequestState.succeeded;
            state.msConfigList = _.get(msConfigList, 'msConfigs.items', []);
            state.msConfigList.forEach((msConfig) => {
                Vue.set(state.msConfigMap, msConfig.id, msConfig);
            });
            _.get(msConfigList, 'subscribers.items', []).forEach((subscriber) => {
                Vue.set(state.subscriberMap, subscriber.id, subscriber);
            });
            state.msConfigListVisible = true;
        },
        msConfigCreationRequesting(state, data) {
            state.msConfigCreationState = CreationState.creating;
            state.msConfigCreationData = data;
        },
        msConfigCreationSucceeded(state) {
            state.msConfigCreationState = CreationState.created;
        },
        msConfigCreationFailed(state, err) {
            state.msConfigCreationState = CreationState.error;
            state.msConfigCreationError = err;
        },
        msConfigRemovalRequesting(state, msConfigId) {
            state.msConfigRemovalState = RequestState.requesting;
            if(msConfigId) {
                state.msConfigRemoving = state.msConfigMap[msConfigId];
            }
        },
        msConfigRemovalCanceled(state) {
            state.msConfigRemovalState = RequestState.initiated;
            state.msConfigRemoving = null;
        },
        msConfigRemovalSucceeded(state) {
            state.msConfigRemovalState = RequestState.succeeded;
        },
        msConfigRemovalFailed(state, err) {
            state.msConfigRemovalState = RequestState.failed;
            state.msConfigRemovalError = err;
        },
        msConfigUpdateRequesting(state, options) {
            state.msConfigUpdateState = RequestState.requesting;
            state.msConfigUpdating = state.msConfigMap[options.msConfigId];
            state.msConfigUpdatingField = options.field;
        },
        msConfigUpdateSucceeded(state, preferences) {
            state.msConfigUpdateState = RequestState.succeeded;
            if(preferences) {
                for(let i = 0; i < state.msConfigList.length; i++) {
                    if(state.msConfigList[i].id === preferences.id) {
                        state.msConfigList[i] = preferences;
                    }
                }
                Vue.delete(state.msConfigMap, preferences.id);
                Vue.set(state.msConfigMap, preferences.id, preferences);
            }
        },
        msConfigUpdateFailed(state, err) {
            state.msConfigUpdateState = RequestState.failed;
            state.msConfigUpdateError = err;
        },
        enableMsConfigAddForm(state) {
            state.msConfigCreationState = CreationState.input;
        },
        disableMsConfigAddForm(state) {
            state.msConfigCreationState = CreationState.initiated;
        },
        expandMsConfig(state, msConfigId) {
            state.msConfigSelected = state.msConfigMap[msConfigId];
        },
        collapseMsConfig(state) {
            state.msConfigSelected = null;
        }
    },
    actions: {
        loadMsConfigList(context, options) {
            return new Promise((resolve)=>{
                let listVisible = _.get(options, 'listVisible', false);
                let selectedId = _.get(options, 'selectedId', null);
                context.commit('msConfigListRequesting', {
                    listVisible: listVisible
                });
                getMsConfigList().then((msConfigList)=>{
                    context.commit('msConfigListSucceeded', msConfigList);
                    if(selectedId !== null) {
                        context.commit('expandMsConfig', msConfigList);
                        context.commit('highlightMsConfig', msConfigList);
                    }
                    resolve();
                }).catch(()=>{
                    resolve();
                    context.commit('msConfigListSucceeded');
                });
            });
        },
        createMsConfig(context, msConfigData) {
            context.commit('msConfigCreationRequesting', msConfigData);
            createMsConfig(msConfigData).then(()=>{
                return context.dispatch('loadMsConfigList',{
                    listVisible: true
                });
            }).then(()=>{
                context.commit('msConfigCreationSucceeded');
            }).catch((err)=>{
                console.debug(err);
                context.commit('msConfigCreationFailed', err.message);
            });
        },
        removeMsConfig(context) {
            context.commit('msConfigRemovalRequesting');
            removeMsConfig(context.state.msConfigRemoving.id).then(()=>{
                return context.dispatch('loadMsConfigList',{
                    listVisible: true
                });
            }).then(()=>{
                context.commit('msConfigRemovalSucceeded');
            }).catch((err)=>{
                console.debug(err);
                context.commit('msConfigRemovalFailed', err.message);
            });
        },
        setSecretaryNumbers(context, options) {
            context.commit('msConfigUpdateRequesting', {
                msConfigId: options.msConfigId,
                field: i18n.t('pbxConfig.msConfigNumbersLabel')
            });
            setSecretaryNumber(options).then((preferences)=>{
                context.commit('msConfigUpdateSucceeded', preferences);
            }).catch((err)=>{
                console.debug(err);
                context.commit('msConfigUpdateFailed', err.message);
            });
        },
        jumpToMsConfig(context, subscriber) {
            router.push({path: '/user/pbx-configuration/ms-configs'});
            context.commit('expandMsConfig', subscriber.id);
        }
    }
};
