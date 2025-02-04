import {
    cfCreateOfficeHours,
    cfCreateSourceSet,
    cfCreateTimeSetDate,
    cfCreateTimeSetDateRange,
    cfCreateTimeSetWeekdays,
    cfDeleteDestinationSet,
    cfDeleteSourceSet,
    cfDeleteTimeSet,
    cfLoadDestinationSets,
    cfLoadMappingsFull,
    cfLoadSourceSets,
    cfLoadTimeSets, cfUpdateOfficeHours,
    cfUpdateSourceSet,
    cfUpdateTimeSetDate,
    cfUpdateTimeSetDateRange,
    cfUpdateTimeSetWeekdays
} from 'src/api/call-forwarding'
import { v4 } from 'uuid'
import {
    get,
    getList,
    patchReplace,
    patchReplaceFull,
    post,
    put
} from 'src/api/common'
import { i18n } from 'src/boot/i18n'
import _ from 'lodash'
import { showGlobalError, showGlobalWarning } from 'src/helpers/ui'

const DEFAULT_RING_TIMEOUT = 60
const DEFAULT_PRIORITY = 0
const WAIT_IDENTIFIER = 'csc-cf-mappings-full'

function createDefaultDestination (destination, defaultAnnouncementId) {
    const payload = {
        destination: destination || ' ',
        priority: DEFAULT_PRIORITY,
        timeout: DEFAULT_RING_TIMEOUT
    }
    if (destination === 'customhours') {
        payload.announcement_id = defaultAnnouncementId
    }
    return payload
}

export async function loadMappingsFull ({ dispatch, commit, rootGetters }, id) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    const subscriberId = id || rootGetters['user/getSubscriberId']
    const mappingData = await cfLoadMappingsFull(subscriberId)

    commit('dataSucceeded', {
        mappings: mappingData[0],
        destinationSets: mappingData[1].items,
        sourceSets: mappingData[2].items,
        timeSets: mappingData[3].items
    })
    dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function createMapping ({ dispatch, commit, state, rootGetters }, payload) {
    try {
        dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
        let type = payload.type
        if (payload.type === 'cfu' && state.mappings.cft && state.mappings.cft.length > 0) {
            type = 'cft'
        }
        const subscriberId = payload.subscriberId ? payload.subscriberId : rootGetters['user/getSubscriberId']
        const mappings = _.cloneDeep(state.mappings[type])
        const destinationSet = await post({
            resource: 'cfdestinationsets',
            body: {
                name: 'csc-' + v4(),
                subscriber_id: subscriberId,
                destinations: [createDefaultDestination()]
            }
        })

        mappings.push({
            destinationset_id: destinationSet.id
        })

        const patchedMappings = await patchReplaceFull({
            resource: 'cfmappings',
            resourceId: subscriberId,
            fieldPath: type,
            value: mappings
        })
        const latestDestinationSets = await cfLoadDestinationSets()

        commit('dataSucceeded', {
            mappings: patchedMappings,
            destinationSets: latestDestinationSets.items
        })
    } catch (error) {
        showGlobalError(error.message)
    } finally {
        dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
    }
}

export async function deleteMapping ({ dispatch, commit, state, rootGetters }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    const mappings = _.cloneDeep(state.mappings[payload.type])
    const updatedMappings = mappings.reduce(($updatedMappings, value, index) => {
        if (index !== payload.index) {
            $updatedMappings.push(value)
        }
        return $updatedMappings
    }, [])
    const patchRes = await patchReplaceFull({
        resource: 'cfmappings',
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        fieldPath: payload.type,
        value: updatedMappings
    })

    try {
        await cfDeleteDestinationSet(payload.destinationset_id)
    } catch (e) {
        if (e.code === 404 && e.message === 'Entity \'cfdestinationset\' not found.') {
            // This happens when entity was set by Admin therefore current
            // csc user doesn't have rights to delete the entity from DB.
            showGlobalWarning(i18n.global.tc('Entity belongs to admin'))
        } else {
            showGlobalError(e.message)
        }
    }

    const destinationSets = await cfLoadDestinationSets()
    commit('dataSucceeded', {
        mappings: patchRes,
        destinationSets: destinationSets.items
    })
    dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function toggleMapping ({ dispatch, commit, state, rootGetters }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    const updatedMappings = _.cloneDeep(state.mappings[payload.type])
    updatedMappings[payload.index].enabled = !updatedMappings[payload.index].enabled
    const patchRes = await patchReplaceFull({
        resource: 'cfmappings',
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        fieldPath: payload.type,
        value: updatedMappings
    })
    commit('dataSucceeded', {
        mappings: patchRes
    })
    dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function updateDestination ({ dispatch, commit, state }, payload) {
    dispatch('wait/start', 'csc-cf-destination-set-update', { root: true })
    const destinations = _.cloneDeep(state.destinationSetMap[payload.destinationSetId].destinations)
    destinations[payload.destinationIndex].destination = payload.destination
    await patchReplace({
        resource: 'cfdestinationsets',
        resourceId: payload.destinationSetId,
        fieldPath: 'destinations',
        value: destinations
    })
    const destinationSets = await cfLoadDestinationSets()
    commit('dataSucceeded', {
        destinationSets: destinationSets.items
    })
    dispatch('wait/end', 'csc-cf-destination-set-update', { root: true })
}

export async function addDestination ({ dispatch, commit, state, rootGetters }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    const destinations = _.cloneDeep(state.destinationSetMap[payload.destinationSetId].destinations)
    destinations.push(createDefaultDestination(payload.destination, payload.defaultAnnouncementId))
    await patchReplace({
        resource: 'cfdestinationsets',
        resourceId: payload.destinationSetId,
        fieldPath: 'destinations',
        value: destinations
    })
    const destinationSets = await cfLoadDestinationSets()
    commit('dataSucceeded', {
        destinationSets: destinationSets.items
    })
    dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function rewriteDestination ({ dispatch, commit, state, rootGetters }, destination) {
    try {
        const req = await post({
            resource: 'applyrewrites',
            body: {
                direction: 'callee_in',
                subscriber_id: rootGetters['user/getSubscriberId'],
                numbers: [_.trim(destination)]
            }
        })
        return req.result
    } catch (err) {
        return destination
    }
}

export async function removeDestination ({ dispatch, commit, state }, payload) {
    dispatch('wait/start', 'csc-cf-destination-set-remove', { root: true })
    const destinations = _.cloneDeep(state.destinationSetMap[payload.destinationSetId].destinations)
    const updatedDestinations = destinations.reduce(($updatedDestinations, value, index) => {
        if (index !== payload.destinationIndex) {
            $updatedDestinations.push(value)
        }
        return $updatedDestinations
    }, [])
    await patchReplace({
        resource: 'cfdestinationsets',
        resourceId: payload.destinationSetId,
        fieldPath: 'destinations',
        value: updatedDestinations
    })
    const destinationSets = await cfLoadDestinationSets()
    commit('dataSucceeded', {
        destinationSets: destinationSets.items
    })
    dispatch('wait/end', 'csc-cf-destination-set-remove', { root: true })
}

export async function updateDestinationTimeout ({ dispatch, commit, state }, payload) {
    dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
    const destinations = _.cloneDeep(state.destinationSetMap[payload.destinationSetId].destinations)
    destinations[payload.destinationIndex].timeout = payload.destinationTimeout
    try {
        await patchReplace({
            resource: 'cfdestinationsets',
            resourceId: payload.destinationSetId,
            fieldPath: 'destinations',
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
    const sourceSets = await cfLoadSourceSets()
    commit('dataSucceeded', {
        sourceSets: sourceSets.items
    })
    dispatch('wait/end', 'csc-cf-sourcesets', { root: true })
}

export async function createSourceSet ({ dispatch, commit, rootGetters, state }, payload) {
    try {
        dispatch('wait/start', 'csc-cf-source-set-create', { root: true })
        const sourceSetId = await cfCreateSourceSet(rootGetters['user/getSubscriberId'], payload)
        const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
        updatedMapping[payload.mapping.index].sourceset_id = sourceSetId
        const updatedMappings = await patchReplaceFull({
            resource: 'cfmappings',
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })
        const sourceSets = await cfLoadSourceSets()
        commit('dataSucceeded', {
            mappings: updatedMappings,
            sourceSets: sourceSets.items
        })
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
        if (e.code === 404 && e.message === 'Entity \'sourceset\' not found.') {
            // This happens when CF was set by Admin therefore current
            // csc user doesn't have rights to delete the entity
            showGlobalWarning(i18n.global.tc('Entity belongs to admin'))
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
        const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
        updatedMapping[payload.mapping.index].sourceset_id = null
        updatedMapping[payload.mapping.index].sourceset = null
        const updatedMappings = await patchReplaceFull({
            resource: 'cfmappings',
            resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
            fieldPath: payload.mapping.type,
            value: updatedMapping
        })
        try {
            await cfDeleteSourceSet(payload.id)
        } catch (e) {
            if (e.code === 404 && e.message === 'Entity \'sourceset\' not found.') {
                // This happens when entity was set by Admin therefore current
                // csc user doesn't have rights to delete the entity from DB.
                showGlobalWarning(i18n.global.tc('Entity belongs to admin'))
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
        const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
        updatedMapping[payload.mapping.index].sourceset_id = payload.id
        const updatedMappings = await patchReplaceFull({
            resource: 'cfmappings',
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
        const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
        updatedMapping[payload.mapping.index].sourceset_id = null
        updatedMapping[payload.mapping.index].sourceset = null
        const updatedMappings = await patchReplaceFull({
            resource: 'cfmappings',
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
    const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
    updatedMapping[payload.mapping.index].timeset_id = timeSetId.id
    const updatedMappings = await patchReplaceFull({
        resource: 'cfmappings',
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
    const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
    updatedMapping[payload.mapping.index].timeset_id = null
    updatedMapping[payload.mapping.index].timeset = null
    const updatedMappings = await patchReplaceFull({
        resource: 'cfmappings',
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        fieldPath: payload.mapping.type,
        value: updatedMapping
    })
    try {
        await cfDeleteTimeSet(payload.id)
    } catch (e) {
        if (e.code === 404 && e.message === 'Entity \'cftimeset\' not found.') {
            // This happens when entity was set by Admin therefore current
            // csc user doesn't have rights to delete the entity from DB.
            showGlobalWarning(i18n.global.tc('Entity belongs to admin'))
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

export async function ringPrimaryNumber ({ commit, rootGetters, state }, payload) {
    const mappings = _.cloneDeep(state.mappings)
    mappings.cft = mappings.cfu
    mappings.cfu = []
    mappings.cft_ringtimeout = 60
    const updatedMappings = await put({
        resource: 'cfmappings',
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        body: mappings
    })
    commit('dataSucceeded', {
        mappings: updatedMappings
    })
}

export async function doNotRingPrimaryNumber ({ commit, rootGetters, state }, payload) {
    const mappings = _.cloneDeep(state.mappings)
    mappings.cfu = mappings.cft
    mappings.cft = []
    mappings.cft_ringtimeout = null
    const updatedMappings = await put({
        resource: 'cfmappings',
        resourceId: (payload.subscriberId) ? payload.subscriberId : rootGetters['user/getSubscriberId'],
        body: mappings
    })
    commit('dataSucceeded', {
        mappings: updatedMappings
    })
}

export async function updateRingTimeout ({ commit, rootGetters, state }, payload) {
    // eslint-disable-next-line no-console
    console.debug('aaa')
    const updatedMappings = await patchReplaceFull({
        resource: 'cfmappings',
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
    const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
    updatedMapping[payload.mapping.index].timeset_id = timeSetId.id
    const updatedMappings = await patchReplaceFull({
        resource: 'cfmappings',
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
        if (e.code === 404 && e.message === 'Entity \'timeset\' not found.') {
            // This happens when entity was set by Admin therefore current
            // csc user doesn't have rights to edit the entity.
            showGlobalWarning(i18n.global.tc('Entity belongs to admin'))
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
    const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
    updatedMapping[payload.mapping.index].timeset_id = timeSetId.id
    const updatedMappings = await patchReplaceFull({
        resource: 'cfmappings',
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
        if (e.code === 404 && e.message === 'Entity \'timeset\' not found.') {
            // This happens when entity was set by Admin therefore current
            // csc user doesn't have rights to delete the entity from DB.
            showGlobalWarning(i18n.global.tc('Entity belongs to admin'))
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
    const timeSetId = await cfCreateOfficeHours(rootGetters['user/getSubscriberId'], payload.times)
    const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
    updatedMapping[payload.mapping.index].timeset_id = timeSetId.id
    const updatedMappings = await patchReplaceFull({
        resource: 'cfmappings',
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
    dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
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
    try {
        const announcements = await getList({
            resource: 'soundhandles',
            all: true,
            params: {
                group: 'custom_announcements'
            }
        })
        commit('setAnnouncements', announcements.items.map((item) => { return { label: item.handle, value: item.id } }))
    } catch (err) {
        commit('setAnnouncements', [])
    }
}

export async function getAnnouncementById ({ dispatch, commit, rootGetters, state }, announcementId) {
    const announcement = await get({
        resource: 'soundhandles',
        resourceId: announcementId
    })
    return {
        value: announcement.id,
        label: announcement.handle
    }
}

export async function updateAnnouncement ({ dispatch, commit, state }, payload) {
    try {
        const destinations = _.cloneDeep(state.destinationSetMap[payload.destinationSetId].destinations)
        destinations[payload.destinationIndex].announcement_id = payload.announcementId
        await patchReplace({
            resource: 'cfdestinationsets',
            resourceId: payload.destinationSetId,
            fieldPath: 'destinations',
            value: destinations
        })
    } catch (e) {
        showGlobalError(e.message)
    }

    const destinationSets = await cfLoadDestinationSets()
    commit('dataSucceeded', {
        destinationSets: destinationSets.items
    })
}
