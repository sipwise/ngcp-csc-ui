'use strict'

import { i18n } from 'boot/i18n'
import _ from 'lodash'
import {
    NcosSet,
    NcosSets,
    createSeat,
    getSeatList,
    getSeatPreferences,
    removeSeat,
    setNcosLevelSets,
    setNcosSet,
    setSeatAnnouncementCallSetup,
    setSeatAnnouncementCfu,
    setSeatAnnouncementToCallee,
    setSeatCli,
    setSeatCstaClient,
    setSeatCstaController,
    setSeatDisplayName,
    setSeatExtension,
    setSeatGroups,
    setSeatIgnoreCfWhenHunting,
    setSeatIntraPbx,
    setSeatMusicOnHold,
    setSeatNumbers,
    setSeatSIPPassword,
    setSeatSoundSet,
    setSeatWebPassword,
    setSeatWebUsername
} from 'src/api/pbx-seats'
import { getSubscriberId } from 'src/auth'
import { CreationState, RequestState } from 'src/store/common'

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
        isSeatListEmpty (state) {
            return state.seatListItems.length && state.seatListItems.length === 0
        },
        isSeatMapByIdEmpty (state) {
            return Object.keys(state.seatMapById).length === 0
        },
        isSeatListRequesting (state) {
            return state.seatListState === RequestState.requesting
        },
        isSeatListPaginationActive (state, getters) {
            const requesting = !getters.isSeatListRequesting || getters.isSeatCreating ||
                getters.isSeatRemoving || getters.isSeatUpdating
            return !getters.isSeatListEmpty && requesting && state.seatListLastPage > 1
        },
        isSeatAddFormDisabled (state) {
            return state.seatCreationState === CreationState.initiated ||
                state.seatCreationState === CreationState.created
        },
        isSeatCreating (state) {
            return state.seatCreationState === CreationState.creating
        },
        isSeatRemoving (state) {
            return state.seatRemovalState === RequestState.requesting
        },
        isSeatUpdating (state) {
            return state.seatUpdateState === RequestState.requesting
        },
        isSeatLoading (state, getters) {
            return (seatId) => {
                return (getters.isSeatRemoving && state.seatRemoving.id === seatId) ||
                    (getters.isSeatUpdating && state.seatUpdating.id === seatId)
            }
        },
        getSoundSetBySeatId (state, getters, rootState, rootGetters) {
            return (seatId) => {
                const prefs = state.preferenceMapById[seatId]
                const soundSetName = _.get(prefs, 'contract_sound_set', null)
                if (soundSetName !== null) {
                    return rootGetters['pbx/getSoundSetByName'](soundSetName)
                }
                return null
            }
        },
        getNcosBySeatId (state, getters, rootState, rootGetters) {
            return (seatId) => {
                const prefs = state.preferenceMapById[seatId]
                const ncosName = _.get(prefs, 'ncos', null)
                if (ncosName !== null) {
                    return rootGetters['pbx/getNcosByName'](ncosName)
                }
                return null
            }
        },
        getDefaultNcos (state) {
            return (id) => {
                return state?.preferenceMapById[id]?.ncos
            }
        },
        getDefaultNcosSet (state) {
            return (id) => {
                return state?.preferenceMapById[id]?.ncos_set
            }
        },
        getIntraPbx (state) {
            return (id) => {
                const seatPreferences = state.preferenceMapById[id]
                return seatPreferences && seatPreferences.clir_intrapbx ? state.preferenceMapById[id].clir_intrapbx : false
            }
        },
        getAnnouncementCfu (state) {
            return (id) => {
                const seatPreferences = state.preferenceMapById[id]
                return seatPreferences && seatPreferences.play_announce_before_cf ? state.preferenceMapById[id].play_announce_before_cf : false
            }
        },
        getMusicOnHold (state) {
            return (id) => {
                return state?.preferenceMapById[id]?.music_on_hold || false
            }
        },
        getAnnouncementCallSetup (state) {
            return (id) => {
                const seatPreferences = state.preferenceMapById[id]
                return seatPreferences && seatPreferences.play_announce_before_call_setup ? state.preferenceMapById[id].play_announce_before_call_setup : false
            }
        },
        getAnnouncementToCallee (state) {
            return (id) => {
                const seatPreferences = state.preferenceMapById[id]
                return seatPreferences && seatPreferences.play_announce_to_callee ? state.preferenceMapById[id].play_announce_to_callee : false
            }
        },
        getIgnoreCfWhenHunting (state) {
            return (id) => {
                const seatPreferences = state.preferenceMapById[id]
                return seatPreferences && seatPreferences.ignore_cf_when_hunting ? state.preferenceMapById[id].ignore_cf_when_hunting : false
            }
        },
        getCstaClient (state) {
            return (id) => {
                const seatPreferences = state.preferenceMapById[id]
                return seatPreferences && seatPreferences.csta_client ? state.preferenceMapById[id].csta_client : false
            }
        },
        getCstaController (state) {
            return (id) => {
                const seatPreferences = state.preferenceMapById[id]
                return seatPreferences && seatPreferences.csta_controller ? state.preferenceMapById[id].csta_controller : false
            }
        },
        getCurrentCli (state) {
            return (id) => {
                return state?.preferenceMapById[id]?.cli || false
            }
        },
        getSeatCreatingName (state) {
            return _.get(state, 'seatCreating.name', '')
        },
        getSeatUpdatingField (state) {
            return _.get(state, 'seatUpdatingField', '')
        },
        getSeatRemovingName (state) {
            return _.get(state, 'seatRemoving.display_name', '')
        },
        getSeatRemoveDialogMessage (state, getters) {
            if (state.seatRemoving !== null) {
                return i18n.global.tc('You are about to remove seat {seat}', {
                    seat: getters.getSeatRemovingName
                })
            }
            return ''
        },
        getSeatCreationToastMessage (state, getters) {
            return i18n.global.tc('Added seat {seat}', {
                seat: getters.getSeatCreatingName
            })
        },
        getSeatUpdateToastMessage (state, getters) {
            return i18n.global.tc('Changed {field} successfully', {
                field: getters.getSeatUpdatingField
            })
        },
        getSeatRemovalToastMessage (state, getters) {
            return i18n.global.tc('Removed seat {seat}', {
                seat: getters.getSeatRemovingName
            })
        },
        getSeatOptions (state) {
            const options = []
            state.seatListItems.forEach((seat) => {
                options.push({
                    label: seat.display_name,
                    value: seat.id
                })
            })
            return options
        },
        hasCallQueue (state) {
            return (seatId) => {
                return _.get(state, `preferenceMapById.${seatId}.cloud_pbx_callqueue`, false)
            }
        }
    },
    mutations: {
        seatListItemsSucceeded (state, options) {
            state.seatListState = RequestState.succeeded
            state.seatListCurrentPage = _.get(options, 'page', 1)
            state.seatListItems = _.get(options, 'seats.items', [])
            state.seatListLastPage = _.get(options, 'seats.lastPage', 1)
            state.seatMapById = {}
            state.seatListItems.forEach((seat) => {
                state.seatMapById[seat.id] = seat
            })
            state.preferenceMapById = {}
            _.get(options, 'preferences.items', []).forEach((preference) => {
                state.preferenceMapById[preference.id] = preference
            })
            state.seatListVisibility = 'visible'
        },
        seatListItemsRequesting (state, options) {
            state.seatListState = RequestState.requesting
            const clearList = _.get(options, 'clearList', true)
            if (clearList) {
                state.seatListVisibility = 'hidden'
                state.seatListItems = []
                state.seatMapById = {}
                state.preferenceMapById = {}
                state.seatListLastPage = null
            } else {
                state.seatListVisibility = 'visible'
            }
        },
        seatListItemsFailed (state) {
            state.seatListState = RequestState.failed
        },
        seatCreationRequesting (state, seat) {
            state.seatCreationState = CreationState.creating
            state.seatCreating = seat
        },
        seatCreationSucceeded (state) {
            state.seatCreationState = CreationState.created
        },
        seatCreationFailed (state, err) {
            state.seatCreationState = CreationState.error
            state.seatCreationError = err
        },
        seatUpdateRequesting (state, options) {
            state.seatUpdating = state.seatMapById[options.seatId]
            state.seatUpdatingField = options.seatField
            state.seatUpdateState = RequestState.requesting
        },
        seatUpdateSucceeded (state, options) {
            state.seatUpdating = null
            state.seatUpdateState = RequestState.succeeded
            const seat = _.get(options, 'seat', null)
            const preferences = _.get(options, 'preferences', null)
            if (seat !== null && preferences !== null) {
                delete state.seatMapById[seat.id]
                state.seatMapById[seat.id] = seat
                for (let i = 0; i < state.seatListItems.length; i++) {
                    if (state.seatListItems[i].id === seat.id) {
                        state.seatListItems[i] = seat
                    }
                }
                delete state.preferenceMapById[preferences.id]
                state.preferenceMapById[preferences.id] = preferences
                if (state.seatSelected !== null && state.seatSelected.id === options.seat.id) {
                    state.seatSelected = options.seat
                }
            }
        },
        seatUpdateFailed (state, err) {
            state.seatUpdating = null
            state.seatUpdateState = RequestState.failed
            state.seatUpdateError = err
        },
        seatRemovalRequesting (state, id) {
            state.seatRemovalState = RequestState.requesting
            state.seatRemoving = state.seatMapById[id]
        },
        seatRemovalCanceled (state) {
            state.seatRemovalState = RequestState.initiated
            state.seatRemoving = null
        },
        seatRemovalSucceeded (state) {
            state.seatRemovalState = RequestState.succeeded
        },
        seatRemovalFailed (state, err) {
            state.seatRemovalState = RequestState.failed
            state.seatRemovalError = err
        },
        selectSeat (state, seatId) {
            state.seatSelected = state.seatMapById[seatId]
        },
        resetSelectedSeat (state) {
            state.seatSelected = null
        },
        enableSeatAddForm (state) {
            state.seatCreationState = CreationState.input
            state.seatSelected = null
        },
        disableSeatAddForm (state) {
            state.seatCreationState = CreationState.initiated
        }
    },
    actions: {
        loadPreferences (context, seatId) {
            return getSeatPreferences(seatId)
        },
        loadSeatListItems (context, options) {
            return new Promise((resolve, reject) => {
                const page = _.get(options, 'page', context.state.seatListCurrentPage)
                const clearList = _.get(options, 'clearList', true)
                const displayName = _.get(options, 'display_name', null)
                const pbxExtension = _.get(options, 'pbx_extension', null)
                const primaryNumber = _.get(options, 'primary_number', null)
                const aliasNumber = _.get(options, 'alias_number', null)
                context.commit('seatListItemsRequesting', {
                    clearList
                })
                getSeatList({
                    page,
                    display_name: displayName,
                    pbx_extension: pbxExtension,
                    primary_number: primaryNumber,
                    alias_number: aliasNumber
                }).then((seatList) => {
                    context.commit('pbx/pilotSucceeded', seatList.pilot, { root: true })
                    context.commit('pbx/numbersSucceeded', seatList.numbers, { root: true })
                    context.commit('pbx/soundSetsSucceeded', seatList.soundSets, { root: true })
                    context.commit('pbx/groupsSucceeded', seatList.groups, { root: true })
                    context.commit('seatListItemsSucceeded', {
                        seats: seatList.seats,
                        preferences: seatList.preferences,
                        page
                    })
                    resolve()
                }).catch((err) => {
                    context.commit('seatListItemsFailed', err.message)
                    reject(err)
                })
            })
        },
        createSeat (context, seatData) {
            context.commit('seatCreationRequesting', seatData)
            createSeat(seatData).then(() => {
                return context.dispatch('loadSeatListItems', {
                    page: 1,
                    clearList: false
                })
            }).then(() => {
                context.commit('seatCreationSucceeded')
            }).catch((err) => {
                context.commit('seatCreationFailed', err.message)
            })
        },
        removeSeat (context, options) {
            context.commit('seatRemovalRequesting', options.seatId)
            removeSeat(options.seatId).then(() => {
                return context.dispatch('loadSeatListItems', {
                    page: context.getters.seatListCurrentPage,
                    clearList: false
                })
            }).then(() => {
                context.commit('seatRemovalSucceeded')
            }).catch((err) => {
                context.commit('seatRemovalFailed', err.message)
            })
        },
        setSeatDisplayName (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('Seat displayName')
            })
            setSeatDisplayName({
                seatId: options.seatId,
                displayName: options.displayName
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setSeatWebUsername (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('Seat Web Username')
            })
            setSeatWebUsername({
                seatId: options.seatId,
                webUsername: options.webUsername
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setSeatExtension (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('Extension')
            })
            setSeatExtension({
                seatId: options.seatId,
                seatExtension: options.seatExtension
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setSeatWebPassword (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('Password')
            })
            setSeatWebPassword({
                seatId: options.seatId,
                seatWebPassword: options.seatWebPassword
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setSeatSIPPassword (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('SIP Password')
            })
            setSeatSIPPassword({
                seatId: options.seatId,
                seatSIPPassword: options.seatSIPPassword
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setSeatGroups (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('Groups')
            })
            setSeatGroups({
                seatId: options.seatId,
                groupIds: options.groupIds
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setSeatNumbers (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('Alias Numbers')
            })
            setSeatNumbers({
                seatId: options.seatId,
                pilotId: context.rootGetters['pbx/pilot'].id,
                assignedNumbers: options.assignedNumbers,
                unassignedNumbers: options.unassignedNumbers
            }).then((result) => {
                return Promise.resolve(result)
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setSeatSoundSet (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('Sound Set')
            })
            setSeatSoundSet({
                seatId: options.seatId,
                soundSetId: options.soundSetId
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setNcosSet (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('Ncos')
            })
            setNcosSet({
                seatId: options.seatId,
                ncosId: options.ncosId
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        NcosSet (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: i18n.global.tc('Ncos Set')
            })
            NcosSet({
                seatId: options.seatId,
                ncosSetId: options.ncosSetId
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setNcosLevelSet (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: getSubscriberId(),
                seatField: i18n.global.tc('Ncos')
            })
            setNcosLevelSets({
                seatId: getSubscriberId(),
                ncosId: options.ncosId
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        setNcosSets (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: getSubscriberId(),
                seatField: i18n.global.tc('Ncos Set')
            })
            NcosSets({
                seatId: getSubscriberId(),
                ncosSetId: options.ncosSetId
            }).then((result) => {
                context.commit('seatUpdateSucceeded', result)
            }).catch((err) => {
                context.commit('seatUpdateFailed', err.message)
            })
        },
        async setIntraPbx (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: options.message || i18n.global.tc('the visibility of the number within own PBX')
            })
            try {
                const result = await setSeatIntraPbx(options.seatId, options.intraPbx)
                context.commit('seatUpdateSucceeded', result)
            } catch (err) {
                context.commit('seatUpdateFailed', err.message)
            }
        },
        async setMusicOnHold (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: options.message || i18n.global.tc('music on hold of the seat')
            })
            try {
                const result = await setSeatMusicOnHold(options.seatId, options.musicOnHold)
                context.commit('seatUpdateSucceeded', result)
            } catch (err) {
                context.commit('seatUpdateFailed', err.message)
            }
        },
        async setCli (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: options.message || i18n.global.tc('cli of the seat')
            })
            try {
                const result = await setSeatCli(options.seatId, options.cli)
                context.commit('seatUpdateSucceeded', result)
            } catch (err) {
                context.commit('seatUpdateFailed', err.message)
            }
        },
        async setAnnouncementCfu (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: options.message || i18n.global.tc('the playback announcement as early media before Call Forward Unconditional or Unavailable')
            })
            try {
                const result = await setSeatAnnouncementCfu(options.seatId, options.announcementCfu)
                context.commit('seatUpdateSucceeded', result)
            } catch (err) {
                context.commit('seatUpdateFailed', err.message)
            }
        },
        async setAnnouncementCallSetup (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: options.message || i18n.global.tc('the playback announcement as early media before send the call to callee')
            })
            try {
                const result = await setSeatAnnouncementCallSetup(options.seatId, options.announcementCallSetup)
                context.commit('seatUpdateSucceeded', result)
            } catch (err) {
                context.commit('seatUpdateFailed', err.message)
            }
        },
        async setAnnouncementToCallee (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: options.message || i18n.global.tc('the playback announcement to callee after he answered the call')
            })
            try {
                const result = await setSeatAnnouncementToCallee(options.seatId, options.announcementToCallee)
                context.commit('seatUpdateSucceeded', result)
            } catch (err) {
                context.commit('seatUpdateFailed', err.message)
            }
        },
        async setIgnoreCfWhenHunting (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: options.message || i18n.global.tc('the behavior of the members call forwards from a Cloud PBX subscriber when it is called within a huntgroup')
            })
            try {
                const result = await setSeatIgnoreCfWhenHunting(options.seatId, options.ignoreCfWhenHunting)
                context.commit('seatUpdateSucceeded', result)
            } catch (err) {
                context.commit('seatUpdateFailed', err.message)
            }
        },
        async setCstaClient (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: options.message || i18n.global.tc('the right of this subscriber to be controlled by a CTI subscriber within the same customer using uaCSTA via SIP')
            })
            try {
                const result = await setSeatCstaClient(options.seatId, options.cstaClient)
                context.commit('seatUpdateSucceeded', result)
            } catch (err) {
                context.commit('seatUpdateFailed', err.message)
            }
        },
        async setCstaController (context, options) {
            context.commit('seatUpdateRequesting', {
                seatId: options.seatId,
                seatField: options.message || i18n.global.tc('the right this subscriber to initiate CTI sessions to other subscribers within the same customer using uaCSTA via SIP')
            })
            try {
                const result = await setSeatCstaController(options.seatId, options.cstaController)
                context.commit('seatUpdateSucceeded', result)
            } catch (err) {
                context.commit('seatUpdateFailed', err.message)
            }
        }
    }
}
