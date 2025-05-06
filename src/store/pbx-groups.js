import { i18n } from 'boot/i18n'
import _ from 'lodash'
import {
    createGroup,
    getGroupList,
    removeGroup,
    setGroupAnnouncementCallSetup,
    setGroupAnnouncementCfu,
    setGroupExtension,
    setGroupHuntCancelMode,
    setGroupHuntPolicy,
    setGroupHuntTimeout,
    setGroupName,
    setGroupNumbers,
    setGroupSeats,
    setGroupSoundSet
} from 'src/api/pbx-groups'
import { CreationState, RequestState } from 'src/store/common'

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
        isGroupListEmpty (state) {
            return Array.isArray(state.groupListItems) && state.groupListItems.length === 0
        },
        isGroupListRequesting (state) {
            return state.groupListState === RequestState.requesting
        },
        isGroupListPaginationActive (state, getters) {
            const requesting = !getters.isGroupListRequesting || getters.isGroupCreating ||
                getters.isGroupRemoving || getters.isGroupUpdating
            return !getters.isGroupListEmpty && requesting && state.groupListLastPage > 1
        },
        isGroupAddFormDisabled (state) {
            return state.groupCreationState === CreationState.initiated ||
                state.groupCreationState === CreationState.created
        },
        isGroupCreating (state) {
            return state.groupCreationState === CreationState.creating
        },
        isGroupRemoving (state) {
            return state.groupRemovalState === RequestState.requesting
        },
        isGroupUpdating (state) {
            return state.groupUpdateState === RequestState.requesting
        },
        isGroupLoading (state, getters) {
            return (groupId) => {
                return (getters.isGroupRemoving && state.groupRemoving.id === groupId) ||
                    (getters.isGroupUpdating && state.groupUpdating.id === groupId)
            }
        },
        getSoundSetByGroupId (state, getters, rootState, rootGetters) {
            return (groupId) => {
                const prefs = state.preferenceMapById[groupId]
                const soundSetName = _.get(prefs, 'contract_sound_set', null)
                if (soundSetName !== null) {
                    return rootGetters['pbx/getSoundSetByName'](soundSetName)
                }
                return null
            }
        },
        getGroupCreatingName (state) {
            return _.get(state, 'groupCreating.name', '')
        },
        getGroupUpdatingField (state) {
            return _.get(state, 'groupUpdatingField', '')
        },
        getGroupRemovingName (state) {
            return _.get(state, 'groupRemoving.display_name', '')
        },
        getGroupRemoveDialogMessage (state, getters) {
            if (getters.isGroupRemoving) {
                return i18n.global.t('You are about to remove group {group}', {
                    group: getters.getGroupRemovingName
                })
            }
            return ''
        },
        getGroupCreationToastMessage (state, getters) {
            return i18n.global.t('Added group {group}', {
                group: getters.getGroupCreatingName
            })
        },
        getGroupUpdateToastMessage (state, getters) {
            return i18n.global.t('Changed {field} successfully', {
                field: getters.getGroupUpdatingField
            })
        },
        getGroupRemovalToastMessage (state, getters) {
            return i18n.global.t('Removed group {group}', {
                group: getters.getGroupRemovingName
            })
        },
        getGroupOptions (state) {
            const options = []
            state.groupListItems.forEach((group) => {
                options.push({
                    label: group.display_name,
                    value: group.id
                })
            })
            return options
        },
        getHuntPolicyOptions () {
            return [
                {
                    label: i18n.global.t('Serial Ringing'),
                    value: 'serial'
                },
                {
                    label: i18n.global.t('Parallel Ringing'),
                    value: 'parallel'
                },
                {
                    label: i18n.global.t('Random Ringing'),
                    value: 'random'
                },
                {
                    label: i18n.global.t('Circular Ringing'),
                    value: 'circular'
                }
            ]
        },
        hasCallQueue (state) {
            return (groupId) => {
                return _.get(state, `preferenceMapById.${groupId}.cloud_pbx_callqueue`, false)
            }
        },
        getHuntCancelModeOptions () {
            return [
                {
                    label: i18n.global.t('Using Cancel'),
                    value: 'cancel'
                },
                {
                    label: i18n.global.t('Using Bye'),
                    value: 'bye'
                }
            ]
        },
        getAnnouncementCfu (state) {
            return (id) => {
                const groupPreferences = state.preferenceMapById[id]
                return groupPreferences && groupPreferences.play_announce_before_cf ? state.preferenceMapById[id].play_announce_before_cf : false
            }
        },
        getAnnouncementCallSetup (state) {
            return (id) => {
                const groupPreferences = state.preferenceMapById[id]
                return groupPreferences && groupPreferences.play_announce_before_call_setup ? state.preferenceMapById[id].play_announce_before_call_setup : false
            }
        }
    },
    mutations: {
        groupListItemsSucceeded (state, options) {
            state.groupListState = RequestState.succeeded
            state.groupListCurrentPage = _.get(options, 'page', 1)
            state.groupListItems = _.get(options, 'groups.items', [])
            state.groupListLastPage = _.get(options, 'groups.lastPage', 1)
            state.groupMapById = {}
            state.groupListItems.forEach((group) => {
                state.groupMapById[group.id] = group
            })
            const preferences = _.get(options, 'preferences.items', [])
            preferences.forEach((preference) => {
                state.preferenceMapById[preference.id] = preference
            })
            state.groupListVisibility = 'visible'
        },
        groupListItemsRequesting (state, options) {
            const clearList = _.get(options, 'clearList', true)
            state.groupListState = RequestState.requesting
            state.groupListLastPage = null
            if (clearList) {
                state.groupListVisibility = 'hidden'
                state.groupListItems = []
                state.groupMapById = {}
                state.preferenceMapById = {}
            } else {
                state.groupListVisibility = 'visible'
            }
        },
        groupListItemsFailed (state) {
            state.groupListState = RequestState.failed
        },
        groupCreationRequesting (state, group) {
            state.groupCreationState = CreationState.creating
            state.groupCreating = group
        },
        groupCreationSucceeded (state) {
            state.groupCreationState = CreationState.created
        },
        groupCreationFailed (state, err) {
            state.groupCreationState = CreationState.error
            state.groupCreationError = err
        },
        groupUpdateRequesting (state, options) {
            state.groupUpdating = state.groupMapById[options.groupId]
            state.groupUpdatingField = options.groupField
            state.groupUpdateState = RequestState.requesting
        },
        groupUpdateSucceeded (state, options) {
            state.groupUpdating = null
            state.groupUpdateState = RequestState.succeeded
            const group = _.get(options, 'group', null)
            const preferences = _.get(options, 'preferences', null)
            if (group !== null && preferences !== null) {
                delete state.groupMapById[group.id]
                state.groupMapById[group.id] = group
                for (let i = 0; i < state.groupListItems.length; i++) {
                    if (state.groupListItems[i].id === group.id) {
                        state.groupListItems[i] = group
                    }
                }
                delete state.preferenceMapById[preferences.id]
                state.preferenceMapById[preferences.id] = preferences
                if (state.groupSelected !== null && state.groupSelected.id === options.group.id) {
                    state.groupSelected = options.group
                }
            }
        },
        groupUpdateFailed (state, err) {
            state.groupUpdating = null
            state.groupUpdateState = RequestState.failed
            state.groupUpdateError = err
        },
        groupRemovalRequesting (state, id) {
            state.groupRemovalState = RequestState.requesting
            state.groupRemoving = state.groupMapById[id]
        },
        groupRemovalCanceled (state) {
            state.groupRemovalState = RequestState.initiated
            state.groupRemoving = null
        },
        groupRemovalSucceeded (state) {
            state.groupRemovalState = RequestState.succeeded
        },
        groupRemovalFailed (state, err) {
            state.groupRemovalState = RequestState.failed
            state.groupRemovalError = err
        },
        selectGroup (state, groupId) {
            state.groupSelected = state.groupMapById[groupId]
        },
        resetSelectedGroup (state) {
            state.groupSelected = null
        },
        enableGroupAddForm (state) {
            state.groupCreationState = CreationState.input
            state.groupSelected = null
        },
        disableGroupAddForm (state) {
            state.groupCreationState = CreationState.initiated
        }
    },
    actions: {
        loadGroupListItems (context, options) {
            return new Promise((resolve, reject) => {
                const page = _.get(options, 'page', context.state.groupListCurrentPage)
                const filters = _.get(options, 'filters', {})
                const clearList = _.get(options, 'clearList', true)
                context.commit('groupListItemsRequesting', {
                    clearList
                })
                getGroupList({
                    page,
                    filters
                }).then((groupList) => {
                    context.commit('pbx/pilotSucceeded', groupList.pilot, { root: true })
                    context.commit('pbx/numbersSucceeded', groupList.numbers, { root: true })
                    context.commit('pbx/soundSetsSucceeded', groupList.soundSets, { root: true })
                    context.commit('pbx/seatsSucceeded', groupList.seats, { root: true })
                    context.commit('groupListItemsSucceeded', {
                        groups: groupList.groups,
                        preferences: groupList.preferences,
                        page
                    })
                    resolve()
                }).catch((err) => {
                    context.commit('groupListItemsFailed', err.message)
                    reject(err)
                })
            })
        },
        createGroup (context, groupData) {
            context.commit('groupCreationRequesting', groupData)
            createGroup(groupData).then(() => {
                return context.dispatch('loadGroupListItems', {
                    page: 1,
                    clearList: false
                })
            }).then(() => {
                context.commit('groupCreationSucceeded')
            }).catch((err) => {
                context.commit('groupCreationFailed', err.message)
            })
        },
        removeGroup (context, options) {
            context.commit('groupRemovalRequesting', options.groupId)
            removeGroup(options.groupId).then(() => {
                return context.dispatch('loadGroupListItems', {
                    page: context.state.groupListCurrentPage,
                    clearList: false
                })
            }).then(() => {
                context.commit('groupRemovalSucceeded')
            }).catch((err) => {
                context.commit('groupRemovalFailed', err.message)
            })
        },
        setGroupName (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.global.t('Group Name')
            })
            setGroupName({
                groupId: options.groupId,
                groupName: options.groupName
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message)
            })
        },
        setGroupExtension (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.global.t('Extension')
            })
            setGroupExtension({
                groupId: options.groupId,
                groupExtension: options.groupExtension
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message)
            })
        },
        setGroupHuntPolicy (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.global.t('Hunt Policy')
            })
            setGroupHuntPolicy({
                groupId: options.groupId,
                groupHuntPolicy: options.groupHuntPolicy
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message)
            })
        },
        setGroupHuntTimeout (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.global.t('Hunt Policy')
            })
            setGroupHuntTimeout({
                groupId: options.groupId,
                groupHuntTimeout: options.groupHuntTimeout
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message)
            })
        },
        setGroupHuntCancelMode (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.global.t('Hunt Cancel Mode')
            })
            setGroupHuntCancelMode({
                groupId: options.groupId,
                groupHuntCancelMode: options.groupHuntCancelMode
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message)
            })
        },
        setGroupNumbers (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.global.t('Alias Numbers')
            })
            setGroupNumbers({
                groupId: options.groupId,
                pilotId: context.rootGetters['pbx/pilot'].id,
                assignedNumbers: options.assignedNumbers,
                unassignedNumbers: options.unassignedNumbers
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message)
            })
        },
        setGroupSeats (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.global.t('Seats')
            })
            setGroupSeats({
                groupId: options.groupId,
                seatIds: options.seatIds
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message)
            })
        },
        setGroupSoundSet (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: i18n.global.t('Sound Set')
            })
            setGroupSoundSet({
                groupId: options.groupId,
                soundSetId: options.soundSetId
            }).then((result) => {
                context.commit('groupUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('groupUpdateFailed', err.message)
            })
        },
        async setAnnouncementCfu (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: options.message || i18n.global.t('the playback announcement as early media before Call Forward Unconditional or Unavailable')
            })
            try {
                const result = await setGroupAnnouncementCfu(options.groupId, options.announcementCfu)
                context.commit('groupUpdateSucceeded', result)
            } catch (err) {
                context.commit('groupUpdateFailed', err.message)
            }
        },
        async setAnnouncementCallSetup (context, options) {
            context.commit('groupUpdateRequesting', {
                groupId: options.groupId,
                groupField: options.message || i18n.global.t('the playback announcement as early media before send the call to callee')
            })
            try {
                const result = await setGroupAnnouncementCallSetup(options.groupId, options.announcementCallSetup)
                context.commit('groupUpdateSucceeded', result)
            } catch (err) {
                context.commit('groupUpdateFailed', err.message)
            }
        }
    }
}
