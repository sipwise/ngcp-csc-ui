'use strict';

import Vue from 'vue'
import {
    CreationState,
    RequestState
} from "./common";
import {
    getSoundSetList,
    createSoundSet,
    removeSoundSet,
    setAsDefault,
    setSoundSetName,
    setSoundSetDescription
} from "../api/pbx-soundsets";
import _ from "lodash";
import {i18n} from "../i18n";

export let soundSetFiles = new Map();

export default {
    namespaced: true,
    state: {
        soundSetListState: RequestState.initiated,
        soundSetListVisible: true,
        soundSetList: [],
        soundSetMap: {},
        soundSetListCurrentPage: 1,
        soundSetListLastPage: null,
        soundSetCreationState: CreationState.initiated,
        soundSetRemovalState: CreationState.initiated,
        soundSetRemoving: null,
        soundSetUpdateState: CreationState.initiated,
        soundSetUpdating: null,
        soundSetSelected: null
        // soundHandleList: [],
        // soundHandleMap: {},
        // soundFileMap: {},

        // soundSetSelected: null,
        // soundSetDeleting: null,
        // soundSetUpdating: null,
        // soundHandleListItems: [],
        // soundHandleMapById: {},
        // soundFileMapByIntId: {},
        // soundFileDeleting: null,
        // soundFileUpdating: null,
        // soundFilePlaying: null
    },
    getters: {
        isSoundSetListEmpty(state) {
            return state.soundSetList.length && state.soundSetList.length === 0;
        },
        isSoundSetListRequesting(state) {
            return state.soundSetListState === RequestState.requesting;
        },
        isSoundSetAddFormEnabled(state) {
            return state.soundSetCreationState !== CreationState.initiated &&
                state.soundSetCreationState !== CreationState.created;
        },
        isSoundSetListPaginationActive(state, getters) {
            let requesting = !getters.isSoundSetListRequesting || getters.isSoundSetCreating ||
                getters.isSoundSetRemoving || getters.isSoundSetUpdating;
            return !getters.isSoundSetListEmpty && requesting &&
                state.soundSetListLastPage > 1;
        },
        isSoundSetCreating(state) {
            return state.soundSetCreationState === CreationState.creating;
        },
        isSoundSetRemoving(state) {
            return state.soundSetRemovalState === RequestState.requesting;
        },
        isSoundSetUpdating(state) {
            return state.soundSetUpdateState === RequestState.requesting;
        },
        isSoundSetLoading(state) {
            return (id)=>{
                return (state.soundSetRemovalState === RequestState.requesting &&
                    state.soundSetRemoving !== null && state.soundSetRemoving.id === id) ||
                    (state.soundSetUpdateState === RequestState.requesting &&
                        state.soundSetUpdating !== null && state.soundSetUpdating.id === id);
            };
        },
        isSoundSetExpanded(state) {
            return (id)=>{
                return state.soundSetSelected !== null && state.soundSetSelected.id === id;
            };
        },
        getSoundSetRemoveDialogMessage(state) {
            if(state.soundSetRemoving !== null) {
                let id = _.get(state, 'soundSetRemoving.id', null);
                return i18n.t('pbxConfig.soundSetRemovalDialogText', {
                    soundSet: _.get(state, 'soundSetMap.' + id + '.name', null)
                });
            }
            return '';
        }
    },
    mutations: {
        soundSetListRequesting(state, options) {
            state.soundSetListState = RequestState.requesting;
            state.soundSetListVisible = options.listVisible;
            if(!options.listVisible) {
                state.soundSetList = [];
                state.soundSetMap = {};
            }
        },
        soundSetListSucceeded(state, soundSetList) {
            state.soundSetListState = RequestState.succeeded;
            state.soundSetListCurrentPage = soundSetList.page;
            state.soundSetListVisible = true;
            state.soundSetListLastPage = _.get(soundSetList, 'soundSets.lastPage', 1);
            state.soundSetList = _.get(soundSetList, 'soundSets.items', []);
            state.soundSetList.forEach((soundSet)=>{
                Vue.set(state.soundSetMap, soundSet.id, soundSet);
            });
        },
        soundSetCreationRequesting(state) {
            state.soundSetCreationState = CreationState.creating;
        },
        soundSetCreationSucceeded(state) {
            state.soundSetCreationState = CreationState.created;
        },
        soundSetCreationFailed(state) {
            state.soundSetCreationState = CreationState.error;
        },
        soundSetUpdateRequesting(state, soundSetId) {
            state.soundSetUpdateState = RequestState.requesting;
            state.soundSetUpdating = state.soundSetMap[soundSetId];
        },
        soundSetUpdateSucceeded(state) {
            state.soundSetUpdateState = RequestState.succeeded;
        },
        soundSetUpdateFailed(state) {
            state.soundSetUpdateState = RequestState.failed;
        },
        soundSetRemovalRequesting(state, soundSetId) {
            state.soundSetRemovalState = RequestState.requesting;
            if(soundSetId) {
                state.soundSetRemoving = state.soundSetMap[soundSetId];
            }
        },
        soundSetRemovalCanceled(state) {
            state.soundSetRemovalState = RequestState.initiated;
            state.soundSetRemoving = null;
        },
        soundSetRemovalSucceeded(state) {
            state.soundSetRemovalState = RequestState.succeeded;
        },
        soundSetRemovalFailed(state) {
            state.soundSetRemovalState = RequestState.failed;
        },
        enableSoundSetAddForm(state) {
            state.soundSetCreationState = CreationState.input;
        },
        disableSoundSetAddForm(state) {
            state.soundSetCreationState = CreationState.initiated;
        },
        expandSoundSet(state, soundSetId) {
            state.soundSetSelected = state.soundSetMap[soundSetId];
        },
        collapseSoundSet(state) {
            state.soundSetSelected = null;
        }
    },
    actions: {
        loadSoundSetList(context, options) {
            return new Promise((resolve)=>{
                let listVisible = _.get(options, 'listVisible', false);
                let page = _.get(options, 'page', context.state.soundSetListCurrentPage);
                context.commit('soundSetListRequesting', {
                    listVisible: listVisible
                });
                getSoundSetList({
                    page: page
                }).then((soundSetList)=>{
                    context.commit('soundSetListSucceeded', {
                        soundSets: soundSetList.soundSets,
                        page: page
                    });
                    resolve();
                }).catch((err)=>{
                    console.debug(err);
                    context.commit('soundSetListSucceeded', {
                        soundSets: []
                    });
                    resolve();
                });
            });
        },
        createSoundSet(context, options) {
            context.commit('soundSetCreationRequesting');
            createSoundSet(options).then(()=>{
                return context.dispatch('loadSoundSetList', {
                    listVisible: true,
                    page: context.state.soundSetListLastPage
                });
            }).then(()=>{
                context.commit('soundSetCreationSucceeded');
            }).catch((err)=>{
                context.commit('soundSetCreationFailed', err.message);
            });
        },
        removeSoundSet(context) {
            context.commit('soundSetRemovalRequesting');
            removeSoundSet(context.state.soundSetRemoving.id).then(()=>{
                return context.dispatch('loadSoundSetList',{
                    listVisible: true,
                    page: context.state.soundSetListCurrentPage
                });
            }).then(()=>{
                context.commit('soundSetRemovalSucceeded');
            }).catch((err)=>{
                context.commit('soundSetRemovalFailed', err.message);
            });
        },
        setAsDefaultSoundSet(context, soundSetId) {
            context.commit('soundSetUpdateRequesting', soundSetId);
            setAsDefault(soundSetId).then(()=>{
                return context.dispatch('loadSoundSetList', {
                    listVisible: true,
                    page: context.state.soundSetListCurrentPage
                });
            }).then(()=>{
                context.commit('soundSetUpdateSucceeded');
            }).catch((err)=>{
                context.commit('soundSetUpdateFailed', err.message);
            });
        },
        setSoundSetName(context, options) {
            context.commit('soundSetUpdateRequesting', options.soundSetId);
            setSoundSetName(options.soundSetId, options.name).then(()=>{
                return context.dispatch('loadSoundSetList', {
                    listVisible: true,
                    page: context.state.soundSetListCurrentPage
                });
            }).then(()=>{
                context.commit('soundSetUpdateSucceeded');
            }).catch((err)=>{
                context.commit('soundSetUpdateFailed', err.message);
            });
        },
        setSoundSetDescription(context, options) {
            context.commit('soundSetUpdateRequesting', options.soundSetId);
            setSoundSetDescription(options.soundSetId, options.description).then(()=>{
                return context.dispatch('loadSoundSetList', {
                    listVisible: true,
                    page: context.state.soundSetListCurrentPage
                });
            }).then(()=>{
                context.commit('soundSetUpdateSucceeded');
            }).catch((err)=>{
                context.commit('soundSetUpdateFailed', err.message);
            });
        }
    }
};
