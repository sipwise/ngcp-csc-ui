import {
    cfCreateBNumberSet,
    cfCreateDestinationSet,
    cfCreateOfficeHours,
    cfCreateSourceSet,
    cfCreateTimeSetDate,
    cfCreateTimeSetDateRange,
    cfCreateTimeSetWeekdays,
    cfDeleteBNumberSet,
    cfDeleteSourceSet,
    cfDeleteTimeSet,
    cfGetAnnouncement,
    cfLoadAnnouncements,
    cfLoadBNumberSets,
    cfLoadDestinationSets,
    cfLoadMappings,
    cfLoadMappingsFull,
    cfLoadSourceSets,
    cfLoadTimeSets,
    cfRewriteDestination,
    cfUpdateBNumberSet,
    cfUpdateDestinationSets,
    cfUpdateFullMapping,
    cfUpdateMappingField,
    cfUpdateOfficeHours,
    cfUpdateSourceSet,
    cfUpdateTimeSetDate,
    cfUpdateTimeSetDateRange,
    cfUpdateTimeSetWeekdays
} from 'src/api/call-forwarding'
import { getSubscriberSeats } from 'src/api/subscriber'
import { i18n } from 'src/boot/i18n'
import { canMoveDestination, normalizePriorities } from 'src/helpers/call-forwarding-destinations'
import { showGlobalError, showGlobalWarning } from 'src/helpers/ui'

const DEFAULT_RING_TIMEOUT = 60
const DEFAULT_PRIORITY = 0
const WAIT_IDENTIFIER = 'csc-cf-mappings-full'

function createDefaultDestination (destination, defaultAnnouncementId, priority = DEFAULT_PRIORITY) {
    const payload = {
        destination: destination || ' ',
        priority,
        timeout: DEFAULT_RING_TIMEOUT
    }
    if (destination === 'customhours') {
        payload.announcement_id = defaultAnnouncementId
    }
    return payload
}

export async function loadMappingsFull ({ dispatch, commit, rootGetters }, subscriberId) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    try {
        const mappingData = await cfLoadMappingsFull(subscriberId)

        commit('dataSucceeded', {
            mappings: mappingData[0],
            destinationSets: mappingData[1].items,
            sourceSets: mappingData[2].items,
            timeSets: mappingData[3].items,
            bNumberSets: mappingData[4].items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
    }
}

export async function loadSeats ({ commit }, options = {}) {
    const seatList = await getSubscriberSeats({
        ...options
    })
    commit('seatsSucceeded', seatList.items || [])
    return seatList
}

export async function createMapping ({ dispatch, commit, state, rootGetters }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    const subscriberId = payload.subscriberId || rootGetters['user/getSubscriberId']
    const currentMappings = { ...state.mappings }

    try {
        let validatedDestination = null
        if (payload.simple_destination) {
            validatedDestination = await dispatch('rewriteDestination', payload.destination)
        }

        const newDestination = {
            destination: validatedDestination || payload.destination,
            priority: DEFAULT_PRIORITY,
            timeout: DEFAULT_RING_TIMEOUT,
            announcement_id: payload.announcementId,
            ...(payload.simple_destination ? { simple_destination: payload.simple_destination } : {})
        }

        const destinationSet = await cfCreateDestinationSet({
            subscriber_id: subscriberId,
            destinations: [newDestination]
        })

        if (!destinationSet.id) {
            throw new Error('Something went wrong. Please retry later')
        }

        const patchedMappings = await updateMapping(
            subscriberId,
            payload.type,
            currentMappings,
            destinationSet.id
        )

        const latestDestinationSets = await cfLoadDestinationSets()

        commit('dataSucceeded', {
            mappings: patchedMappings,
            destinationSets: latestDestinationSets.items
        })
        commit('cfCreationSucceeded')
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
    }
}

export async function deleteMapping ({ dispatch, commit, state, rootGetters }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    try {
        const currentMappings = { ...state.mappings }
        const subscriberId = payload.subscriberId || rootGetters['user/getSubscriberId']
        const type = payload.type

        const draftMappingsByType = currentMappings[type].filter((item) => item.cfm_id !== payload.cfm_id)

        if (type === 'cft' && draftMappingsByType.length === 0) {
            currentMappings.cft_ringtimeout = DEFAULT_RING_TIMEOUT
        }

        const updatedMappings = await cfUpdateFullMapping({
            subscriberId,
            body: {
                ...currentMappings,
                [type]: draftMappingsByType
            }
        })

        commit('dataSucceeded', {
            mappings: updatedMappings
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
    }
}

export async function setMappingEnabled ({ dispatch, commit, state, rootGetters }, payload) {
    try {
        dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
        const resourceId = payload.subscriberId || rootGetters['user/getSubscriberId']
        const mappingsByType = [...state.mappings[payload.type]]

        mappingsByType[payload.index] = {
            ...mappingsByType[payload.index],
            enabled: !mappingsByType[payload.index].enabled
        }

        await cfUpdateMappingField({
            resource: 'cfmappings',
            resourceId,
            fieldPath: payload.type,
            value: mappingsByType
        })

        const updatedMappings = await cfLoadMappings(resourceId)

        commit('dataSucceeded', { mappings: updatedMappings })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
    }
}

async function updateMapping (
    subscriberId,
    type,
    currentMappings,
    destinationSetId
) {
    const newMapping = {
        destinationset_id: destinationSetId,
        enabled: false
    }

    if (type === 'cft' && currentMappings.cft_ringtimeout === null) {
        currentMappings.cft_ringtimeout = DEFAULT_RING_TIMEOUT
    }

    return cfUpdateFullMapping({
        subscriberId,
        body: {
            ...currentMappings,
            [type]: [
                ...currentMappings[type],
                newMapping
            ]
        }
    })
}

export async function updateDestination ({ dispatch, commit, state }, payload) {
    dispatch('wait/start', 'csc-cf-destination-set-update', { root: true })
    try {
        const destinations = [...state.destinationSetMap[payload.destinationSetId].destinations]
        destinations[payload.destinationIndex] = {
            ...destinations[payload.destinationIndex],
            destination: payload.destination
        }

        await cfUpdateDestinationSets({
            resourceId: payload.destinationSetId,
            value: destinations
        })

        const destinationSets = await cfLoadDestinationSets()
        commit('dataSucceeded', {
            destinationSets: destinationSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-destination-set-update', { root: true })
    }
}

export async function addDestination ({ dispatch, commit, state }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    try {
        const destinations = [...state.destinationSetMap[payload.destinationSetId].destinations]
        const normalizedDestinations = normalizePriorities(destinations)

        normalizedDestinations.push(createDefaultDestination(
            payload.destination,
            payload.defaultAnnouncementId,
            normalizedDestinations.length
        ))

        await cfUpdateDestinationSets({
        resourceId: payload.destinationSetId,
        value: normalizedDestinations
        })

        const destinationSets = await cfLoadDestinationSets()
        commit('dataSucceeded', {
            destinationSets: destinationSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
    }
}

export async function rewriteDestination ({ rootGetters }, destination) {
    try {
        const req = await cfRewriteDestination({
                subscriberId: rootGetters['user/getSubscriberId'],
                numbers: [destination?.trim()]
        })
        return req.result
    } catch (err) {
        return destination.trim()
    }
}

export async function removeDestination ({ dispatch, commit, state }, payload) {
    dispatch('wait/start', 'csc-cf-destination-set-remove', { root: true })
    try {
        const destinations = [...state.destinationSetMap[payload.destinationSetId].destinations]
        const updatedDestinations = normalizePriorities(
            destinations.filter((_, index) => index !== payload.destinationIndex)
        )

        await cfUpdateDestinationSets({
            resourceId: payload.destinationSetId,
            value: updatedDestinations
        })

        const destinationSets = await cfLoadDestinationSets()
        commit('dataSucceeded', {
            destinationSets: destinationSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-destination-set-remove', { root: true })
    }
}

export async function moveDestination ({ dispatch, commit, state }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    try {
        const destinations = [...state.destinationSetMap[payload.destinationSetId].destinations]
        if (payload.destinationFromIndex < 0 ||
            payload.destinationToIndex < 0 ||
            payload.destinationFromIndex >= destinations.length ||
            payload.destinationToIndex >= destinations.length) {
            return
        }
        if (!canMoveDestination(destinations, payload.destinationFromIndex, payload.destinationToIndex)) {
            return
        }

        const [movedDestination] = destinations.splice(payload.destinationFromIndex, 1)
        destinations.splice(payload.destinationToIndex, 0, movedDestination)
        const reorderedDestinations = destinations.map((destination, index) => ({
            ...destination,
            priority: index
        }))

        await cfUpdateDestinationSets({
            resourceId: payload.destinationSetId,
            value: reorderedDestinations
        })

        const destinationSets = await cfLoadDestinationSets()
        commit('dataSucceeded', {
            destinationSets: destinationSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
    }
}

export async function updateDestinationTimeout ({ dispatch, commit, state }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    const destinations = [...state.destinationSetMap[payload.destinationSetId].destinations]
    destinations[payload.destinationIndex] = {
        ...destinations[payload.destinationIndex],
        timeout: payload.destinationTimeout
    }
    try {
        await cfUpdateDestinationSets({
            resourceId: payload.destinationSetId,
            value: destinations
        })
    } catch (e) {
        showGlobalError(e.message)
    }
    const destinationSets = await cfLoadDestinationSets()
    commit('dataSucceeded', {
        destinationSets: destinationSets.items
    })
    dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function loadSourceSets ({ dispatch, commit }) {
    dispatch('wait/start', 'csc-cf-sourcesets', { root: true })
    try {
        const sourceSets = await cfLoadSourceSets()
        commit('dataSucceeded', {
            sourceSets: sourceSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-sourcesets', { root: true })
    }
}

export async function createBNumberSet ({ dispatch, commit, rootGetters, state }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-b-number-set-create', { root: true })
        const bNumberSetId = await cfCreateBNumberSet(rootGetters['user/getSubscriberId'], payload)
        const updatedMapping = [...state.mappings[payload.mapping.type]]
        updatedMapping[payload.mapping.index] = {
            ...updatedMapping[payload.mapping.index],
            bnumberset_id: bNumberSetId
        }
        const updatedMappings = await cfUpdateMappingField({
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })
        const bNumberSets = await cfLoadBNumberSets()
        commit('dataSucceeded', {
            mappings: updatedMappings,
            bNumberSets: bNumberSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-b-number-set-create', { root: true })
    }
}

export async function loadBNumberSets ({ dispatch, commit }) {
    dispatch('wait/start', 'csc-cf-b-number-set', { root: true })
    try {
        const bNumberSets = await cfLoadBNumberSets()
        commit('dataSucceeded', {
            bNumberSets: bNumberSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-b-number-set', { root: true })
    }
}

export async function updateBNumberSet ({ dispatch, commit, rootGetters }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-b-number-set-create', { root: true })
        await cfUpdateBNumberSet(rootGetters['user/getSubscriberId'], payload)
        const bNumberSets = await cfLoadBNumberSets()
        commit('dataSucceeded', {
            bNumberSets: bNumberSets.items
        })
    } catch (e) {
        if (e.code === 404 && e.message === 'Entity \'cfbnumberset\' not found.') {
            // This happens when entity was set by Admin therefore current
            // csc user doesn't have rights to edit the entity.
            showGlobalWarning(i18n.global.t('Entity is restricted or no longer exists.'))
        } else {
            showGlobalError(e.message)
        }
    } finally {
        dispatch('wait/end', 'csc-cf-b-number-set-create', { root: true })
    }
}

export async function deleteBNumberSet ({ dispatch, commit, rootGetters, state }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-b-number-set-create', { root: true })
        const updatedMapping = [...state.mappings[payload.mapping.type]]
        updatedMapping[payload.mapping.index] = {
            ...updatedMapping[payload.mapping.index],
            bnumberset_id: null,
            bnumberset: null
        }
        const updatedMappings = await cfUpdateMappingField({
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })

        try {
            await cfDeleteBNumberSet(payload.id)
        } catch (e) {
            if (e.code === 404 && e.message === 'Entity \'cfbnumberset\' not found.') {
                // This happens when entity was set by Admin therefore current
                // csc user doesn't have rights to delete the entity from DB.
                // In this scenario the b-number is only removed from the mappings.
                showGlobalWarning(i18n.global.t('Entity is restricted or no longer exists.'))
            } else {
                showGlobalError(e.message)
            }
        }

        const bNumberSets = await cfLoadBNumberSets()
        commit('dataSucceeded', {
            mappings: updatedMappings,
            bNumberSets: bNumberSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-b-number-set-create', { root: true })
    }
}

export async function assignBNumberSet ({ dispatch, commit, rootGetters, state }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-b-number-set-create', { root: true })
        const updatedMapping = [...state.mappings[payload.mapping.type]]
        updatedMapping[payload.mapping.index] = {
            ...updatedMapping[payload.mapping.index],
            bnumberset_id: payload.id
        }
        const updatedMappings = await cfUpdateMappingField({
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })
        commit('dataSucceeded', {
            mappings: updatedMappings
        })
    } finally {
        dispatch('wait/end', 'csc-cf-b-number-set-create', { root: true })
    }
}

export async function unassignBNumberSet ({ dispatch, commit, rootGetters, state }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-b-number-set-create', { root: true })
        const updatedMapping = [...state.mappings[payload.mapping.type]]
        updatedMapping[payload.mapping.index] = {
            ...updatedMapping[payload.mapping.index],
            bnumberset_id: null,
            bnumberset: null
        }
        const updatedMappings = await cfUpdateMappingField({
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })
        commit('dataSucceeded', {
            mappings: updatedMappings
        })
    } finally {
        dispatch('wait/end', 'csc-cf-b-number-set-create', { root: true })
    }
}

export async function createSourceSet ({ dispatch, commit, rootGetters, state }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-source-set-create', { root: true })
        const sourceSetId = await cfCreateSourceSet(rootGetters['user/getSubscriberId'], payload)
        const updatedMapping = [...state.mappings[payload.mapping.type]]
        updatedMapping[payload.mapping.index] = {
            ...updatedMapping[payload.mapping.index],
            sourceset_id: sourceSetId
        }
        const updatedMappings = await cfUpdateMappingField({
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })
        const sourceSets = await cfLoadSourceSets()
        commit('dataSucceeded', {
            mappings: updatedMappings,
            sourceSets: sourceSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-source-set-create', { root: true })
    }
}

export async function updateSourceSet ({ dispatch, commit, rootGetters }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-source-set-create', { root: true })
        await cfUpdateSourceSet(rootGetters['user/getSubscriberId'], payload)
        const sourceSets = await cfLoadSourceSets()
        commit('dataSucceeded', {
            sourceSets: sourceSets.items
        })
    } catch (e) {
        if (e.code === 404 && e.message === 'Entity \'cfsourceset\' not found.') {
            // This happens when CF was set by Admin therefore current
            // csc user doesn't have rights to delete the entity
            showGlobalWarning(i18n.global.t('Entity is restricted or no longer exists.'))
        } else {
            showGlobalError(e.message)
        }
    } finally {
        dispatch('wait/end', 'csc-cf-source-set-create', { root: true })
    }
}

export async function deleteSourceSet ({ dispatch, commit, rootGetters, state }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-source-set-create', { root: true })
        const updatedMapping = [...state.mappings[payload.mapping.type]]
        updatedMapping[payload.mapping.index] = {
            ...updatedMapping[payload.mapping.index],
            sourceset_id: null,
            sourceset: null
        }
        const updatedMappings = await cfUpdateMappingField({
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })

        try {
            await cfDeleteSourceSet(payload.id)
        } catch (e) {
            if (e.code === 404 && e.message === 'Entity \'cfsourceset\' not found.') {
                // This happens when entity was set by Admin therefore current
                // csc user doesn't have rights to delete the entity from DB.
                // In this scenario the sources is only removed from the mappings.
                showGlobalWarning(i18n.global.t('Entity is restricted or no longer exists.'))
                // Force reload of SourceSets
            } else {
                throw e
            }
        }

        const sourceSets = await cfLoadSourceSets()
        commit('dataSucceeded', {
            mappings: updatedMappings,
            sourceSets: sourceSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-source-set-create', { root: true })
    }
}

export async function assignSourceSet ({ dispatch, commit, rootGetters, state }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-source-set-create', { root: true })
        const updatedMapping = [...state.mappings[payload.mapping.type]]
        updatedMapping[payload.mapping.index] = {
            ...updatedMapping[payload.mapping.index],
            sourceset_id: payload.id
        }
        const updatedMappings = await cfUpdateMappingField({
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })
        commit('dataSucceeded', {
            mappings: updatedMappings
        })
    } finally {
        dispatch('wait/end', 'csc-cf-source-set-create', { root: true })
    }
}

export async function unassignSourceSet ({ dispatch, commit, rootGetters, state }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-source-set-create', { root: true })
        const updatedMapping = [...state.mappings[payload.mapping.type]]
        updatedMapping[payload.mapping.index] = {
            ...updatedMapping[payload.mapping.index],
            sourceset_id: null,
            sourceset: null
        }
        const updatedMappings = await cfUpdateMappingField({
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })
        commit('dataSucceeded', {
            mappings: updatedMappings
        })
    } finally {
        dispatch('wait/end', 'csc-cf-source-set-create', { root: true })
    }
}

export async function createTimeSetDate ({ dispatch, commit, rootGetters, state }, payload) {
    dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
    const timeSetId = await cfCreateTimeSetDate(rootGetters['user/getSubscriberId'], payload.date)
    const updatedMapping = [...state.mappings[payload.mapping.type]]
    updatedMapping[payload.mapping.index] = {
        ...updatedMapping[payload.mapping.index],
        timeset_id: timeSetId.id
    }
    const updatedMappings = await cfUpdateMappingField({
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        fieldPath: payload.mapping.type,
        value: updatedMapping
    })
    const timeSets = await cfLoadTimeSets()
    commit('dataSucceeded', {
        mappings: updatedMappings,
        timeSets: timeSets.items
    })
    dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function updateTimeSetDate ({ dispatch, commit }, payload) {
    dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
    try {
        await cfUpdateTimeSetDate(payload.id, payload.date)
        const timeSets = await cfLoadTimeSets()
        commit('dataSucceeded', {
            timeSets: timeSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
    }
}

export async function deleteTimeSet ({ dispatch, commit, rootGetters, state }, payload) {
    dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
    const updatedMapping = [...state.mappings[payload.mapping.type]]
    updatedMapping[payload.mapping.index] = {
        ...updatedMapping[payload.mapping.index],
        timeset_id: null,
        timeset: null
    }
    const updatedMappings = await cfUpdateMappingField({
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        fieldPath: payload.mapping.type,
        value: updatedMapping
    })
    try {
        await cfDeleteTimeSet(payload.id)
    } catch (e) {
        if (e.code === 404 && e.message === 'Entity \'cftimeset\' not found.') {
            // This happens when CF was set by Admin therefore current
            // csc user doesn't have rights to delete the entity
            showGlobalWarning(i18n.global.t('Entity is restricted or no longer exists.'))
        } else {
            showGlobalError(e.message)
        }
    }
    const timeSets = await cfLoadTimeSets()
    commit('dataSucceeded', {
        mappings: updatedMappings,
        timeSets: timeSets.items
    })
    dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function updateRingTimeout ({ commit, rootGetters, state }, payload) {
    const updatedMappings = await cfUpdateMappingField({
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        fieldPath: 'cft_ringtimeout',
        value: payload.ringTimeout
    })
    commit('dataSucceeded', {
        mappings: updatedMappings
    })
}

export async function createTimeSetDateRange ({ dispatch, commit, rootGetters, state }, payload) {
    dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
    const timeSetId = await cfCreateTimeSetDateRange(rootGetters['user/getSubscriberId'], payload.date)
    const updatedMapping = [...state.mappings[payload.mapping.type]]
    updatedMapping[payload.mapping.index] = {
        ...updatedMapping[payload.mapping.index],
        timeset_id: timeSetId.id
    }
    const updatedMappings = await cfUpdateMappingField({
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        fieldPath: payload.mapping.type,
        value: updatedMapping
    })
    const timeSets = await cfLoadTimeSets()
    commit('dataSucceeded', {
        mappings: updatedMappings,
        timeSets: timeSets.items
    })
    dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function updateTimeSetDateRange ({ dispatch, commit }, payload) {
    dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
    try {
        await cfUpdateTimeSetDateRange(payload.id, payload.date)
    } catch (e) {
        if (e.code === 404 && e.message === 'Entity \'cftimeset\' not found.') {
            // This happens when CF was set by Admin therefore current
            // csc user doesn't have rights to delete the entity
            showGlobalWarning(i18n.global.t('Entity is restricted or no longer exists.'))
        } else {
            showGlobalError(e.message)
        }
    }

    const timeSets = await cfLoadTimeSets()
    commit('dataSucceeded', {
        timeSets: timeSets.items
    })
    dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function createTimeSetWeekdays ({ dispatch, commit, rootGetters, state }, payload) {
    dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
    const timeSetId = await cfCreateTimeSetWeekdays(rootGetters['user/getSubscriberId'], payload.weekdays)
    const updatedMapping = [...state.mappings[payload.mapping.type]]
    updatedMapping[payload.mapping.index] = {
        ...updatedMapping[payload.mapping.index],
        timeset_id: timeSetId.id
    }
    const updatedMappings = await cfUpdateMappingField({
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        fieldPath: payload.mapping.type,
        value: updatedMapping
    })
    const timeSets = await cfLoadTimeSets()
    commit('dataSucceeded', {
        mappings: updatedMappings,
        timeSets: timeSets.items
    })
    dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function updateTimeSetWeekdays ({ dispatch, commit }, payload) {
    dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
    try {
        await cfUpdateTimeSetWeekdays(payload.id, payload.weekdays)
    } catch (e) {
        if (e.code === 404 && e.message === 'Entity \'cftimeset\' not found.') {
            // This happens when CF was set by Admin therefore current
            // csc user doesn't have rights to delete the entity
            showGlobalWarning(i18n.global.t('Entity is restricted or no longer exists.'))
        } else {
            showGlobalError(e.message)
        }
    }

    const timeSets = await cfLoadTimeSets()
    commit('dataSucceeded', {
        timeSets: timeSets.items
    })
    dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function createOfficeHours ({ dispatch, commit, rootGetters, state }, payload) {
    dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
    try {
        const timeSetId = await cfCreateOfficeHours(rootGetters['user/getSubscriberId'], payload.times)
        const updatedMapping = [...state.mappings[payload.mapping.type]]
        updatedMapping[payload.mapping.index] = {
            ...updatedMapping[payload.mapping.index],
            timeset_id: timeSetId.id
        }

        const updatedMappings = await cfUpdateMappingField({
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })
        if (payload.id) {
            await cfDeleteTimeSet(payload.id)
        }

        const timeSets = await cfLoadTimeSets()

        commit('dataSucceeded', {
            mappings: updatedMappings,
            timeSets: timeSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
    }
}

export async function updateOfficeHours ({ dispatch, commit, rootGetters, state }, payload) {
    dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
    try {
        await cfUpdateOfficeHours(payload.id, payload.times)
    } catch (e) {
        showGlobalError(e.message)
    }

    const timeSets = await cfLoadTimeSets()
    commit('dataSucceeded', {
        timeSets: timeSets.items
    })
    dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function loadAnnouncements ({ dispatch, commit }) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    try {
        const announcements = await cfLoadAnnouncements()
        commit('setAnnouncements', announcements.items.map((item) => {
            return { label: item.handle, value: item.id }
        }))
    } catch (err) {
        commit('setAnnouncements', [])
    } finally {
        dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
    }
}

export async function getAnnouncementById (_, announcementId) {
    try {
        const announcement = await cfGetAnnouncement(announcementId)
        return {
            value: announcement.id,
            label: announcement.handle
        }
    } catch (e) {
        showGlobalError(e.message)
    }
}

export async function updateAnnouncement ({ dispatch, commit, state }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    try {
        const destinations = [...state.destinationSetMap[payload.destinationSetId].destinations]
        destinations[payload.destinationIndex] = {
            ...destinations[payload.destinationIndex],
            announcement_id: payload.announcementId
        }
        await cfUpdateDestinationSets({
            resourceId: payload.destinationSetId,
            value: destinations
        })

        const destinationSets = await cfLoadDestinationSets()
        commit('dataSucceeded', {
            destinationSets: destinationSets.items
        })
    } catch (e) {
        showGlobalError(e.message)
    } finally {
        dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
    }
}

export function resetCallForwardingState ({ commit }) {
        commit('resetState')
}
