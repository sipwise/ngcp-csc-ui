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
    setSoundSetDescription,
    getAllSoundHandles,
    getAllSoundFilesBySoundSetId,
    getSoundFile,
    uploadSoundFile,
    setLoopPlay, unsetAsDefault
} from "../api/pbx-soundsets";
import _ from "lodash";
import {
    i18n
} from "../i18n";

let soundFileUploadRequests = new Map();

export function toFileId(options){
    return [
        options.soundSetId,
        options.soundHandle
    ].join('-')
}

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
        soundSetSelected: null,
        soundHandleList: [],
        soundHandleListState: RequestState.initiated,
        soundFileMap: {},
        soundFileUrlMap: {},
        soundFileListStates: {},
        soundFileState: {},
        soundFileUploadState: {},
        soundFileUploadProgress: {},
        soundFileUpdateState: {}
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
                    soundSetName: _.get(state, 'soundSetMap.' + id + '.name', null)
                });
            }
            return '';
        },
        isSoundHandleListRequesting(state) {
            return state.soundHandleListState === RequestState.requesting;
        },
        isSoundFileListRequesting(state) {
            return (soundSetId)=>{
                return state.soundFileListStates[soundSetId] &&
                    state.soundFileListStates[soundSetId] === RequestState.requesting;
            };
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
        },
        soundHandlesRequesting(state) {
            state.soundHandleListState = RequestState.requesting;
        },
        soundHandlesSucceeded(state, soundHandles) {
            state.soundHandleListState = RequestState.succeeded;
            state.soundHandleList = _.get(soundHandles, 'items', []);
        },
        soundFilesRequesting(state, soundSetId) {
            Vue.delete(state.soundFileListStates, soundSetId);
            Vue.set(state.soundFileListStates, soundSetId, RequestState.requesting);
        },
        soundFilesSucceeded(state, soundFilesList) {
            Vue.delete(state.soundFileListStates, soundFilesList.soundSetId);
            Vue.set(state.soundFileListStates, soundFilesList.soundSetId, RequestState.succeeded);
            _.get(soundFilesList, 'soundFiles.items', []).forEach((soundFile)=>{
                Vue.set(state.soundFileMap, toFileId({
                    soundSetId: soundFile.set_id,
                    soundHandle: soundFile.handle
                }), soundFile);
            });
        },
        soundFileRequesting(state, options) {
            Vue.delete(state.soundFileState, options.soundFile.id);
            Vue.set(state.soundFileState, options.soundFile.id, RequestState.requesting);
        },
        soundFileSucceeded(state, options) {
            let soundFileIntId = toFileId({
                soundSetId: options.soundFile.set_id,
                soundHandle: options.soundFile.handle
            });
            Vue.delete(state.soundFileState, options.soundFile.id);
            Vue.set(state.soundFileState, options.soundFile.id, RequestState.succeeded);
            Vue.delete(state.soundFileUrlMap, soundFileIntId);
            Vue.set(state.soundFileUrlMap, soundFileIntId, options.soundFileUrl);
        },
        soundFileFailed(state, options) {
            Vue.delete(state.soundFileState, options.soundFile.id);
            Vue.set(state.soundFileState, options.soundFile.id, RequestState.failed);
        },
        soundFileUploadRequesting(state, soundFileId) {
            Vue.delete(state.soundFileUploadState, soundFileId);
            Vue.set(state.soundFileUploadState, soundFileId, RequestState.requesting);
        },
        soundFileUploadProgressed(state, options) {
            Vue.delete(state.soundFileUploadProgress, options.soundFileId);
            Vue.set(state.soundFileUploadProgress, options.soundFileId, options.progress);
        },
        soundFileUploadSucceeded(state, options) {
            let soundFileId = toFileId({
                soundSetId: options.soundFile.set_id,
                soundHandle: options.soundFile.handle
            });
            Vue.delete(state.soundFileUploadState, soundFileId);
            Vue.set(state.soundFileUploadState, soundFileId, RequestState.succeeded);
            Vue.delete(state.soundFileMap, soundFileId);
            Vue.set(state.soundFileMap, soundFileId, options.soundFile);
            Vue.delete(state.soundFileUrlMap, soundFileId);
            Vue.set(state.soundFileUrlMap, soundFileId, options.soundFileUrl);
            Vue.delete(state.soundFileUploadProgress, soundFileId);
            Vue.set(state.soundFileUploadProgress, soundFileId, 0);
        },
        soundFileUploadAborted(state, options) {
            Vue.delete(state.soundFileUploadState, options.soundFileId);
            Vue.set(state.soundFileUploadState, options.soundFileId, RequestState.failed);
        },
        soundFileUpdateRequesting(state, options) {
            let soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            });
            Vue.delete(state.soundFileUpdateState, soundFileIntId);
            Vue.set(state.soundFileUpdateState, soundFileIntId, RequestState.requesting);
        },
        soundFileUpdateSucceeded(state, soundFile) {
            let soundFileIntId = toFileId({
                soundSetId: soundFile.set_id,
                soundHandle: soundFile.handle
            });
            Vue.delete(state.soundFileUpdateState, soundFileIntId);
            Vue.set(state.soundFileUpdateState, soundFileIntId, RequestState.succeeded);
            Vue.delete(state.soundFileMap, soundFileIntId);
            Vue.set(state.soundFileMap, soundFileIntId, soundFile);
        },
        soundFileUpdateFailed(state, options) {
            let soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            });
            Vue.delete(state.soundFileUpdateState, soundFileIntId);
            Vue.set(state.soundFileUpdateState, soundFileIntId, RequestState.failed);
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
        setAsDefaultSoundSet(context, options) {
            context.commit('soundSetUpdateRequesting', options.soundSetId);
            let func = setAsDefault;
            if(options.contractDefault !== true) {
                func = unsetAsDefault;
            }
            func(options.soundSetId).then(()=>{
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
        },
        loadSoundSetResources(context, soundSetId) {
            if(context.state.soundHandleListState !== RequestState.succeeded) {
                context.commit('soundHandlesRequesting');
                getAllSoundHandles().then((soundHandles)=>{
                    context.commit('soundHandlesSucceeded', soundHandles);
                }).catch((err)=>{
                    console.debug(err);
                    context.commit('soundHandlesSucceeded', {
                        items: []
                    });
                });
            }
            if(context.state.soundFileListStates[soundSetId] !== RequestState.succeeded) {
                context.commit('soundFilesRequesting', soundSetId);
                getAllSoundFilesBySoundSetId(soundSetId).then((soundFiles)=>{
                    context.commit('soundFilesSucceeded', {
                        soundSetId: soundSetId,
                        soundFiles: soundFiles
                    });
                }).catch((err)=>{
                    console.debug(err);
                    context.commit('soundFilesSucceeded', {
                        soundSetId: soundSetId,
                        soundFiles: {
                            items: []
                        }
                    })
                });
            }
        },
        playSoundFile(context, soundFile) {
            context.commit('soundFileRequesting', {
                soundFile: soundFile
            });
            getSoundFile({
                id: soundFile.id
            }).then((soundFileUrl)=>{
                context.commit('soundFileSucceeded', {
                    soundFile: soundFile,
                    soundFileUrl: soundFileUrl
                });
            }).catch((err)=>{
                console.debug(err);
                context.commit('soundFileFailed', {
                    soundFile: soundFile
                });
            });
        },
        uploadSoundFile(context, options) {
            context.commit('soundFileUploadRequesting', toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            }));
            uploadSoundFile({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle,
                soundFileData: options.soundFileData,
                initialized: (request) => {
                    soundFileUploadRequests.set(toFileId({
                        soundSetId: options.soundSetId,
                        soundHandle: options.soundHandle
                    }), request);
                },
                progressed: (progress)=>{
                    context.commit('soundFileUploadProgressed', {
                        soundFileId: toFileId({
                            soundSetId: options.soundSetId,
                            soundHandle: options.soundHandle
                        }),
                        progress: progress
                    });
                }
            }).then((res)=>{
                context.commit('soundFileUploadSucceeded', res);
            }).catch((err)=>{
                console.debug(err);
                context.commit('soundFileUploadAborted', {
                    soundFileId: toFileId({
                        soundSetId: options.soundSetId,
                        soundHandle: options.soundHandle
                    })
                });
            });
        },
        setLoopPlay(context, options) {
            context.commit('soundFileUpdateRequesting', options);
            setLoopPlay(options).then((soundFile)=>{
                context.commit('soundFileUpdateSucceeded', soundFile);
            }).catch((err)=>{
                console.debug(err);
                context.commit('soundFileUpdateFailed', options);
            });
        }
    }
};
