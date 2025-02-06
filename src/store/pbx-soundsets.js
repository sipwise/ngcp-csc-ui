import { i18n } from 'boot/i18n'
import _ from 'lodash'
import {
    createSoundSet,
    getAllSoundFilesBySoundSetId,
    getAllSoundHandles,
    getSoundFile,
    getSoundSetList, removeSoundFile,
    removeSoundSet,
    setAsDefault,
    setLoopPlay,
    setSoundSetDescription,
    setSoundSetName,
    setSoundSetParent, setUseParent, unsetAsDefault,
    uploadSoundFile
} from 'src/api/pbx-soundsets'
import { CreationState, RequestState } from 'src/store/common'

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
                return i18n.global.t('You are about to remove sound set {soundSetName}', {
                    soundSetName: _.get(state, `soundSetMap.${id}.name`, null)
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
            return i18n.global.t('Created sound set {soundSet} successfully', {
                soundSet: getters.getSoundSetCreatingName
            })
        },
        getSoundSetUpdateToastMessage (state, getters) {
            return i18n.global.t('Updated {field} for sound set {soundSet} successfully', {
                soundSet: getters.getSoundSetUpdatingName,
                field: getters.getSoundSetUpdatingField
            })
        },
        getSoundSetRemovalToastMessage (state, getters) {
            return i18n.global.t('Removed sound set {soundSet} successfully', {
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
                state.soundSetMap[soundSet.id] = soundSet
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
            const index = state.soundSetList.findIndex((soundSetItem) => {
                return soundSetItem.id === soundSet.id
            })
            state.soundSetMap[soundSet.id] = soundSet
            state.soundSetList[index] = soundSet
            if (state?.soundSetSelected?.id === soundSet.id) {
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
            const index = state.soundSetList.findIndex((soundSetItem) => {
                return soundSetItem.id === soundSetId
            })
            delete state.soundSetMap[soundSetId]
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
                return soundHandle
            })
            state.soundHandleGroups.map((group) => {
                state.soundHandleList[group] = soundHandleList.filter((soundHandle) => {
                    return group === soundHandle.group
                })
                return group
            })
        },
        soundFilesRequesting (state, soundSetId) {
            delete state.soundFileListStates[soundSetId]
            state.soundFileListStates[soundSetId] = RequestState.requesting
        },
        soundFilesSucceeded (state, soundFilesList) {
            delete state.soundFileListStates[soundFilesList.soundSetId]
            state.soundFileListStates[soundFilesList.soundSetId] = RequestState.succeeded

            _.get(soundFilesList, 'soundFiles.items', []).forEach((soundFile) => {
                state.soundFileMap[toFileId({
                    soundSetId: soundFile.set_id,
                    soundHandle: soundFile.handle
                })] = soundFile
            })
        },
        soundFileRequesting (state, options) {
            delete state.soundFileState[options.soundFile.id]
            state.soundFileState[options.soundFile.id] = RequestState.requesting
        },
        soundFileSucceeded (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundFile.set_id,
                soundHandle: options.soundFile.handle
            })
            delete state.soundFileState[options.soundFile.id]
            state.soundFileState[options.soundFile.id] = RequestState.succeeded
            delete state.soundFileUrlMap[soundFileIntId]
            state.soundFileUrlMap[soundFileIntId] = options.soundFileUrl
        },
        soundFileFailed (state, options) {
            delete state.soundFileState[options.soundFile.id]
            state.soundFileState[options.soundFile.id] = RequestState.failed
        },
        soundFileUploadRequesting (state, soundFileId) {
            delete state.soundFileUploadState[soundFileId]
            state.soundFileUploadState[soundFileId] = RequestState.requesting
        },
        soundFileUploadProgressed (state, options) {
            delete state.soundFileUploadProgress[options.soundFileId]
            state.soundFileUploadProgress[options.soundFileId] = options.progress
        },
        soundFileUploadSucceeded (state, options) {
            const soundFileId = toFileId({
                soundSetId: options.soundFile.set_id,
                soundHandle: options.soundFile.handle
            })
            delete state.soundFileUploadState[soundFileId]
            state.soundFileUploadState[soundFileId] = RequestState.succeeded
            delete state.soundFileMap[soundFileId]
            state.soundFileMap[soundFileId] = options.soundFile
            delete state.soundFileUrlMap[soundFileId]
            state.soundFileUrlMap[soundFileId] = options.soundFileUrl
            delete state.soundFileUploadProgress[soundFileId]
            state.soundFileUploadProgress[soundFileId] = 0
        },
        soundFileUploadAborted (state, options) {
            delete state.soundFileUploadState[options.soundFileId]
            state.soundFileUploadState[options.soundFileId] = RequestState.failed
        },
        soundFileUpdateRequesting (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            })

            delete state.soundFileUpdateState[soundFileIntId]
            state.soundFileUpdateState[soundFileIntId] = RequestState.requesting
        },
        soundFileUpdateSucceeded (state, soundFile) {
            const soundFileIntId = toFileId({
                soundSetId: soundFile.set_id,
                soundHandle: soundFile.handle
            })
            delete state.soundFileUpdateState[soundFileIntId]
            state.soundFileUpdateState[soundFileIntId] = RequestState.succeeded

            delete state.soundFileMap[soundFileIntId]
            state.soundFileMap[soundFileIntId] = soundFile
        },
        soundFileUpdateFailed (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            })
            delete state.soundFileUpdateState[soundFileIntId]
            state.soundFileUpdateState[soundFileIntId] = RequestState.failed
        },
        soundFileRemoveRequesting (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            })
            delete state.soundFileRemoveState[soundFileIntId]
            state.soundFileRemoveState[soundFileIntId] = RequestState.requesting
        },
        soundFileRemoveSucceeded (state, soundFile) {
            const soundFileIntId = toFileId({
                soundSetId: soundFile.soundSetId,
                soundHandle: soundFile.soundHandle
            })
            delete state.soundFileRemoveState[soundFileIntId]
            state.soundFileRemoveState[soundFileIntId] = RequestState.succeeded
            delete state.soundFileMap[soundFileIntId]
        },
        soundFileRemoveFailed (state, options) {
            const soundFileIntId = toFileId({
                soundSetId: options.soundSetId,
                soundHandle: options.soundHandle
            })
            delete state.soundFileRemoveState[soundFileIntId]
            state.soundFileRemoveState[soundFileIntId] = RequestState.failed
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
                    listVisible
                })
                let page = _.get(options, 'page', context.state.soundSetListCurrentPage)
                page = (page === null) ? 1 : page
                getSoundSetList({
                    page
                }).then((soundSetList) => {
                    context.commit('soundSetListSucceeded', {
                        soundSets: soundSetList.soundSets,
                        page
                    })
                    resolve()
                }).catch(() => {
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
                field: i18n.global.t('default option')
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
                field: i18n.global.t('name')
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
                field: i18n.global.t('description')
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
                field: i18n.global.t('parent')
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
                }).catch(() => {
                    context.commit('soundHandlesSucceeded', {
                        items: []
                    })
                })
            }
            if (context.state.soundFileListStates[soundSetId] !== RequestState.succeeded) {
                context.commit('soundFilesRequesting', soundSetId)
                getAllSoundFilesBySoundSetId(soundSetId).then((soundFiles) => {
                    context.commit('soundFilesSucceeded', {
                        soundSetId,
                        soundFiles
                    })
                }).catch(() => {
                    context.commit('soundFilesSucceeded', {
                        soundSetId,
                        soundFiles: {
                            items: []
                        }
                    })
                })
            }
        },
        playSoundFile (context, soundFile) {
            context.commit('soundFileRequesting', {
                soundFile
            })
            getSoundFile({
                id: soundFile.id
            }).then((soundFileUrl) => {
                context.commit('soundFileSucceeded', {
                    soundFile,
                    soundFileUrl
                })
            }).catch(() => {
                context.commit('soundFileFailed', {
                    soundFile
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
                        progress
                    })
                }
            }).then((res) => {
                context.commit('soundFileUploadSucceeded', res)
            }).catch(() => {
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
            }).catch(() => {
                context.commit('soundFileUpdateFailed', options)
            })
        },
        setUseParent (context, options) {
            context.commit('soundFileUpdateRequesting', options)
            setUseParent(options).then((soundFile) => {
                context.commit('soundFileUpdateSucceeded', soundFile)
            }).catch(() => {
                context.commit('soundFileUpdateFailed', options)
            })
        },
        removeSoundFile (context, options) {
            context.commit('soundFileRemoveRequesting', options)
            removeSoundFile(options.soundFileId).then(() => {
                context.commit('soundFileRemoveSucceeded', options)
            }).catch(() => {
                context.commit('soundFileRemoveFailed', options)
            })
        }
    }
}
