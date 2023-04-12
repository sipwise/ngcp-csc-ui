
import Vue from 'vue'
import {
    CreationState,
    RequestState
} from './common'

import {
    getSoundSetList,
    createSoundSet,
    removeSoundSet,
    setAsDefault,
    setSoundSetName,
    setSoundSetDescription,
    setSoundSetParent,
    getAllSoundHandles,
    getAllSoundFilesBySoundSetId,
    getSoundFile,
    uploadSoundFile,
    setLoopPlay, unsetAsDefault, setUseParent, removeSoundFile
} from '../api/pbx-soundsets'
import _ from 'lodash'
import {
    i18n
} from 'src/boot/i18n'

const soundFileUploadRequests = new Map()

export function toFileId (options) {
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
        soundSetCreationData: null,
        soundSetCreationError: null,
        soundSetRemovalState: CreationState.initiated,
        soundSetRemoving: null,
        soundSetRemovalError: null,
        soundSetUpdateState: CreationState.initiated,
        soundSetUpdateError: null,
        soundSetUpdating: null,
        soundSetUpdatingField: null,
        soundSetSelected: null,
        soundHandleList: {},
        soundHandleListState: RequestState.initiated,
        soundFileMap: {},
        soundFileUrlMap: {},
        soundFileListStates: {},
        soundFileState: {},
        soundFileUploadState: {},
        soundFileUploadProgress: {},
        soundFileUpdateState: {},
        soundFileRemoveState: {},
        soundHandleGroups: []
    },
    getters: {
        isSoundSetListEmpty (state) {
            return Array.isArray(state.soundSetList) && state.soundSetList.length === 0
        },
        isSoundSetListRequesting (state) {
            return state.soundSetListState === RequestState.requesting
        },
        isSoundSetAddFormEnabled (state) {
            return state.soundSetCreationState !== CreationState.initiated &&
                state.soundSetCreationState !== CreationState.created
        },
        isSoundSetListPaginationActive (state, getters) {
            const requesting = !getters.isSoundSetListRequesting || getters.isSoundSetCreating ||
                getters.isSoundSetRemoving || getters.isSoundSetUpdating
            return !getters.isSoundSetListEmpty && requesting &&
                state.soundSetListLastPage > 1
        },
        isSoundSetCreating (state) {
            return state.soundSetCreationState === CreationState.creating
        },
        isSoundSetRemoving (state) {
            return state.soundSetRemovalState === RequestState.requesting
        },
        isSoundSetUpdating (state) {
            return state.soundSetUpdateState === RequestState.requesting
        },
        isSoundSetLoading (state) {
            return (id) => {
                return (state.soundSetRemovalState === RequestState.requesting &&
                    state.soundSetRemoving !== null && state.soundSetRemoving.id === id) ||
                    (state.soundSetUpdateState === RequestState.requesting &&
                        state.soundSetUpdating !== null && state.soundSetUpdating.id === id)
            }
        },
        getSoundSetRemoveDialogMessage (state) {
            if (state.soundSetRemoving !== null) {
                const id = _.get(state, 'soundSetRemoving.id', null)
                return i18n.t('You are about to remove sound set {soundSetName}', {
                    soundSetName: _.get(state, 'soundSetMap.' + id + '.name', null)
                })
            }
            return ''
        },
        getSoundSetRemovingName (state) {
            return _.get(state.soundSetRemoving, 'name', '')
        },
        getSoundSetCreatingName (state) {
            return _.get(state.soundSetCreationData, 'name', '')
        },
        getSoundSetUpdatingName (state) {
            return _.get(state.soundSetUpdating, 'name', '')
        },
        getSoundSetUpdatingField (state) {
            return state.soundSetUpdatingField
        },
        getSoundSetCreationToastMessage (state, getters) {
            return i18n.t('Created sound set {soundSet} successfully', {
                soundSet: getters.getSoundSetCreatingName
            })
        },
        getSoundSetUpdateToastMessage (state, getters) {
            return i18n.t('Updated {field} for sound set {soundSet} successfully', {
                soundSet: getters.getSoundSetUpdatingName,
                field: getters.getSoundSetUpdatingField
            })
        },
        getSoundSetRemovalToastMessage (state, getters) {
            return i18n.t('Removed sound set {soundSet} successfully', {
                soundSet: getters.getSoundSetRemovingName
            })
        },
        isSoundHandleListRequesting (state) {
            return state.soundHandleListState === RequestState.requesting
        },
        isSoundFileListRequesting (state) {
            return (soundSetId) => {
                return state.soundFileListStates[soundSetId] &&
                    state.soundFileListStates[soundSetId] === RequestState.requesting
            }
        },
        isSoundFileRemoving (state) {
            return state.soundFileRemoveState === RequestState.requesting
        }
    },
    mutations: {
        soundSetListRequesting (state, options) {
            state.soundSetListState = RequestState.requesting
            state.soundSetListVisible = options.listVisible
            if (!options.listVisible) {
                state.soundSetList = []
                state.soundSetMap = {}
            }
        },
        soundSetListSucceeded (state, soundSetList) {
            state.soundSetListState = RequestState.succeeded
            state.soundSetListCurrentPage = soundSetList.page
            state.soundSetListVisible = true
            state.soundSetListLastPage = _.get(soundSetList, 'soundSets.lastPage', 1)
            state.soundSetList = _.get(soundSetList, 'soundSets.items', [])
            state.soundSetList.forEach((soundSet) => {
                Vue.set(state.soundSetMap, soundSet.id, soundSet)
            })
        },
        soundSetCreationRequesting (state, options) {
            state.soundSetCreationState = CreationState.creating
            state.soundSetCreationData = options
        },
        soundSetCreationSucceeded (state) {
            state.soundSetCreationState = CreationState.created
        },
        soundSetCreationFailed (state, err) {
            state.soundSetCreationState = CreationState.error
            state.soundSetCreationError = err
        },
        soundSetUpdateRequesting (state, options) {
            state.soundSetUpdateState = RequestState.requesting
            state.soundSetUpdating = state.soundSetMap[options.soundSetId]
            state.soundSetUpdatingField = options.field
        },
        soundSetUpdateSucceeded (state, soundSet) {
            state.soundSetUpdateState = RequestState.succeeded
            const index = state.soundSetList.findIndex((soundSetItem) => soundSetItem.id === soundSet.id)
            Vue.set(state.soundSetMap, soundSet.id, soundSet)
            state.soundSetList[index] = soundSet
            if (state.soundSetSelected.id === soundSet.id) {
                state.soundSetSelected = soundSet
            }
        },
        soundSetUpdateFailed (state, err) {
            state.soundSetUpdateState = RequestState.failed
            state.soundSetUpdateError = err
        },
        soundSetRemovalRequesting (state, soundSetId) {
            state.soundSetRemovalState = RequestState.requesting
            if (soundSetId) {
                state.soundSetRemoving = state.soundSetMap[soundSetId]
            }
        },
        soundSetRemovalCanceled (state) {
            state.soundSetRemovalState = RequestState.initiated
            state.soundSetRemoving = null
        },
        soundSetRemovalSucceeded (state, soundSetId) {
            state.soundSetRemovalState = RequestState.succeeded
            const index = state.soundSetList.findIndex((soundSetItem) => soundSetItem.id === soundSetId)
            Vue.delete(state.soundSetMap, soundSetId)
            state.soundSetList.splice(index, 1)
        },
        soundSetRemovalFailed (state, err) {
            state.soundSetRemovalState = RequestState.failed
            state.soundSetRemovalError = err
        },
        enableSoundSetAddForm (state) {
            state.soundSetCreationState = CreationState.input
        },
        disableSoundSetAddForm (state) {
            state.soundSetCreationState = CreationState.initiated
        },
        soundHandlesRequesting (state) {
            state.soundHandleListState = RequestState.requesting
        },
        soundHandlesSucceeded (state, soundHandles) {
            state.soundHandleListState = RequestState.succeeded
            const soundHandleList = _.get(soundHandles, 'items', [])
            soundHandleList.map((soundHandle) => {
                if (!state.soundHandleGroups.includes(soundHandle.group)) {
                    state.soundHandleGroups.push(soundHandle.group)
                }
            })
            state.soundHandleGroups.map((group) => {
                Vue.set(state.soundHandleList, group, soundHandleList.filter((soundHandle) => group === soundHandle.group))
            })
        },
        soundFilesRequesting (state, soundSetId) {
            Vue.delete(state.soundFileListStates, soundSetId)
            Vue.set(state.soundFileListStates, soundSetId, RequestState.requesting)
        },
        soundFilesSucceeded (state, soundFilesList) {
            Vue.delete(state.soundFileListStates, soundFilesList.soundSetId)
            Vue.set(state.soundFileListStates, soundFilesList.soundSetId, RequestState.succeeded)
            _.get(soundFilesList, 'soundFiles.items', []).forEach((soundFile) => {
                Vue.set(state.soundFileMap, toFileId({
                    soundSetId: soundFile.set_id,
                    soundHandle: soundFile.handle
                }), soundFile)
            })
        },
        soundFileRequesting (state, options) {
            Vue.delete(state.soundFileState, options.soundFile.id)
            Vue.set(state.soundFileState, options.soundFile.id, RequestState.requesting)
        },
        soundFileSucceeded (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundFile.set_id,
                soundHandle: options.soundFile.handle
            })
            Vue.delete(state.soundFileState, options.soundFile.id)
            Vue.set(state.soundFileState, options.soundFile.id, RequestState.succeeded)
            Vue.delete(state.soundFileUrlMap, soundFileIntId)
            Vue.set(state.soundFileUrlMap, soundFileIntId, options.soundFileUrl)
        },
        soundFileFailed (state, options) {
            Vue.delete(state.soundFileState, options.soundFile.id)
            Vue.set(state.soundFileState, options.soundFile.id, RequestState.failed)
        },
        soundFileUploadRequesting (state, soundFileId) {
            Vue.delete(state.soundFileUploadState, soundFileId)
            Vue.set(state.soundFileUploadState, soundFileId, RequestState.requesting)
        },
        soundFileUploadProgressed (state, options) {
            Vue.delete(state.soundFileUploadProgress, options.soundFileId)
            Vue.set(state.soundFileUploadProgress, options.soundFileId, options.progress)
        },
        soundFileUploadSucceeded (state, options) {
            const soundFileId = toFileId({
                soundSetId: options.soundFile.set_id,
                soundHandle: options.soundFile.handle
            })
            Vue.delete(state.soundFileUploadState, soundFileId)
            Vue.set(state.soundFileUploadState, soundFileId, RequestState.succeeded)
            Vue.delete(state.soundFileMap, soundFileId)
            Vue.set(state.soundFileMap, soundFileId, options.soundFile)
            Vue.delete(state.soundFileUrlMap, soundFileId)
            Vue.set(state.soundFileUrlMap, soundFileId, options.soundFileUrl)
            Vue.delete(state.soundFileUploadProgress, soundFileId)
            Vue.set(state.soundFileUploadProgress, soundFileId, 0)
        },
        soundFileUploadAborted (state, options) {
            Vue.delete(state.soundFileUploadState, options.soundFileId)
            Vue.set(state.soundFileUploadState, options.soundFileId, RequestState.failed)
        },
        soundFileUpdateRequesting (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            })
            Vue.delete(state.soundFileUpdateState, soundFileIntId)
            Vue.set(state.soundFileUpdateState, soundFileIntId, RequestState.requesting)
        },
        soundFileUpdateSucceeded (state, soundFile) {
            const soundFileIntId = toFileId({
                soundSetId: soundFile.set_id,
                soundHandle: soundFile.handle
            })
            Vue.delete(state.soundFileUpdateState, soundFileIntId)
            Vue.set(state.soundFileUpdateState, soundFileIntId, RequestState.succeeded)
            Vue.delete(state.soundFileMap, soundFileIntId)
            Vue.set(state.soundFileMap, soundFileIntId, soundFile)
        },
        soundFileUpdateFailed (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            })
            Vue.delete(state.soundFileUpdateState, soundFileIntId)
            Vue.set(state.soundFileUpdateState, soundFileIntId, RequestState.failed)
        },
        soundFileRemoveRequesting (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            })
            Vue.delete(state.soundFileRemoveState, soundFileIntId)
            Vue.set(state.soundFileRemoveState, soundFileIntId, RequestState.requesting)
        },
        soundFileRemoveSucceeded (state, soundFile) {
            const soundFileIntId = toFileId({
                soundSetId: soundFile.soundSetId,
                soundHandle: soundFile.soundHandle
            })
            Vue.delete(state.soundFileRemoveState, soundFileIntId)
            Vue.set(state.soundFileRemoveState, soundFileIntId, RequestState.succeeded)
            Vue.delete(state.soundFileMap, soundFileIntId)
        },
        soundFileRemoveFailed (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            })
            Vue.delete(state.soundFileRemoveState, soundFileIntId)
            Vue.set(state.soundFileRemoveState, soundFileIntId, RequestState.failed)
        },
        selectSoundSet (state, soundSetId) {
            state.soundSetSelected = state.soundSetMap[soundSetId]
        },
        resetSelectedSoundSet (state) {
            state.soundSetSelected = null
        }
    },
    actions: {
        loadSoundSetList (context, options) {
            return new Promise((resolve) => {
                const listVisible = _.get(options, 'listVisible', false)
                context.commit('soundSetListRequesting', {
                    listVisible: listVisible
                })
                let page = _.get(options, 'page', context.state.soundSetListCurrentPage)
                page = (page === null) ? 1 : page
                getSoundSetList({
                    page: page
                }).then((soundSetList) => {
                    context.commit('soundSetListSucceeded', {
                        soundSets: soundSetList.soundSets,
                        page: page
                    })
                    resolve()
                }).catch((err) => {
                    console.debug(err)
                    context.commit('soundSetListSucceeded', {
                        soundSets: []
                    })
                    resolve()
                })
            })
        },
        createSoundSet (context, options) {
            context.commit('soundSetCreationRequesting', options)
            createSoundSet(options).then(() => {
                return context.dispatch('loadSoundSetList', {
                    listVisible: true,
                    page: context.state.soundSetListLastPage
                })
            }).then(() => {
                context.commit('soundSetCreationSucceeded')
            }).catch((err) => {
                context.commit('soundSetCreationFailed', err.message)
            })
        },
        removeSoundSet (context) {
            context.commit('soundSetRemovalRequesting')
            removeSoundSet(context.state.soundSetRemoving.id).then(() => {
                context.commit('soundSetRemovalSucceeded', context.state.soundSetRemoving.id)
            }).catch((err) => {
                context.commit('soundSetRemovalFailed', err.message)
            })
        },
        setAsDefaultSoundSet (context, options) {
            context.commit('soundSetUpdateRequesting', {
                soundSetId: options.soundSetId,
                field: i18n.t('default option')
            })
            let func = setAsDefault
            if (options.contractDefault !== true) {
                func = unsetAsDefault
            }
            func(options.soundSetId).then((soundSet) => {
                context.commit('soundSetUpdateSucceeded', soundSet)
            }).catch((err) => {
                context.commit('soundSetUpdateFailed', err.message)
            })
        },
        setSoundSetName (context, options) {
            context.commit('soundSetUpdateRequesting', {
                soundSetId: options.soundSetId,
                field: i18n.t('name')
            })
            setSoundSetName(options.soundSetId, options.name).then((soundSet) => {
                context.commit('soundSetUpdateSucceeded', soundSet)
            }).catch((err) => {
                context.commit('soundSetUpdateFailed', err.message)
            })
        },
        setSoundSetDescription (context, options) {
            context.commit('soundSetUpdateRequesting', {
                soundSetId: options.soundSetId,
                field: i18n.t('description')
            })
            setSoundSetDescription(options.soundSetId, options.description).then((soundSet) => {
                context.commit('soundSetUpdateSucceeded', soundSet)
            }).catch((err) => {
                context.commit('soundSetUpdateFailed', err.message)
            })
        },
        setSoundSetParent (context, options) {
            context.commit('soundSetUpdateRequesting', {
                soundSetId: options.soundSetId,
                field: i18n.t('parent')
            })
            setSoundSetParent(options.soundSetId, options.parent_id).then((soundSet) => {
                context.commit('soundSetUpdateSucceeded', soundSet)
            }).catch((err) => {
                context.commit('soundSetUpdateFailed', err.message)
            })
        },
        loadSoundSetResources (context, soundSetId) {
            if (context.state.soundHandleListState !== RequestState.succeeded) {
                context.commit('soundHandlesRequesting')
                getAllSoundHandles().then((soundHandles) => {
                    context.commit('soundHandlesSucceeded', soundHandles)
                }).catch((err) => {
                    console.debug(err)
                    context.commit('soundHandlesSucceeded', {
                        items: []
                    })
                })
            }
            if (context.state.soundFileListStates[soundSetId] !== RequestState.succeeded) {
                context.commit('soundFilesRequesting', soundSetId)
                getAllSoundFilesBySoundSetId(soundSetId).then((soundFiles) => {
                    context.commit('soundFilesSucceeded', {
                        soundSetId: soundSetId,
                        soundFiles: soundFiles
                    })
                }).catch((err) => {
                    console.debug(err)
                    context.commit('soundFilesSucceeded', {
                        soundSetId: soundSetId,
                        soundFiles: {
                            items: []
                        }
                    })
                })
            }
        },
        playSoundFile (context, soundFile) {
            context.commit('soundFileRequesting', {
                soundFile: soundFile
            })
            getSoundFile({
                id: soundFile.id
            }).then((soundFileUrl) => {
                context.commit('soundFileSucceeded', {
                    soundFile: soundFile,
                    soundFileUrl: soundFileUrl
                })
            }).catch((err) => {
                console.debug(err)
                context.commit('soundFileFailed', {
                    soundFile: soundFile
                })
            })
        },
        uploadSoundFile (context, options) {
            context.commit('soundFileUploadRequesting', toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            }))
            uploadSoundFile({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle,
                soundFileData: options.soundFileData,
                initialized: (request) => {
                    soundFileUploadRequests.set(toFileId({
                        soundSetId: options.soundSetId,
                        soundHandle: options.soundHandle
                    }), request)
                },
                progressed: (progress) => {
                    context.commit('soundFileUploadProgressed', {
                        soundFileId: toFileId({
                            soundSetId: options.soundSetId,
                            soundHandle: options.soundHandle
                        }),
                        progress: progress
                    })
                }
            }).then((res) => {
                context.commit('soundFileUploadSucceeded', res)
            }).catch((err) => {
                console.debug(err)
                context.commit('soundFileUploadAborted', {
                    soundFileId: toFileId({
                        soundSetId: options.soundSetId,
                        soundHandle: options.soundHandle
                    })
                })
            })
        },
        setLoopPlay (context, options) {
            context.commit('soundFileUpdateRequesting', options)
            setLoopPlay(options).then((soundFile) => {
                context.commit('soundFileUpdateSucceeded', soundFile)
            }).catch((err) => {
                console.debug(err)
                context.commit('soundFileUpdateFailed', options)
            })
        },
        setUseParent (context, options) {
            context.commit('soundFileUpdateRequesting', options)
            setUseParent(options).then((soundFile) => {
                context.commit('soundFileUpdateSucceeded', soundFile)
            }).catch((err) => {
                console.debug(err)
                context.commit('soundFileUpdateFailed', options)
            })
        },
        removeSoundFile (context, options) {
            context.commit('soundFileRemoveRequesting', options)
            removeSoundFile(options.soundFileId).then(() => {
                context.commit('soundFileRemoveSucceeded', options)
            }).catch((err) => {
                console.debug(err)
                context.commit('soundFileRemoveFailed', options)
            })
        }
    }
}
