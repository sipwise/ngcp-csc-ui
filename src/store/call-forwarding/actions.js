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
import {
	v4
} from 'uuid'
import {
	patchReplace,
	patchReplaceFull,
	post, put, get, getList
} from 'src/api/common'
import _ from 'lodash'

const DEFAULT_RING_TIMEOUT = 60
const DEFAULT_PRIORITY = 0
const WAIT_IDENTIFIER = 'csc-cf-mappings-full'
const DEFAULT_CUSTOM_ANNOUNCEMENT_ID = 255 // TODO get from endpoint

function createDefaultDestination (destination) {
	const payload = {
		destination: destination || 'Number',
		priority: DEFAULT_PRIORITY,
		timeout: DEFAULT_RING_TIMEOUT
	}
	if (destination === 'customhours') {
		payload.announcement_id = DEFAULT_CUSTOM_ANNOUNCEMENT_ID
	}
	return payload
}

export async function loadMappingsFull ({ dispatch, commit, rootGetters }) {
	dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
	const res = await cfLoadMappingsFull(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		mappings: res[0],
		destinationSets: res[1].items,
		sourceSets: res[2].items,
		timeSets: res[3].items
	})
	dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function createMapping ({ dispatch, commit, state, rootGetters }, payload) {
	dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
	let type = payload.type
	if (payload.type === 'cfu' && state.mappings.cft && state.mappings.cft.length > 0) {
		type = 'cft'
	}
	const mappings = _.cloneDeep(state.mappings[type])
	const destinationSetId = await post({
		resource: 'cfdestinationsets',
		body: {
			name: 'csc-' + v4(),
			subscriber_id: rootGetters['user/getSubscriberId'],
			destinations: [createDefaultDestination()]
		}
	})
	mappings.push({
		destinationset_id: destinationSetId
	})
	const res = await Promise.all([
		patchReplaceFull({
			resource: 'cfmappings',
			resourceId: rootGetters['user/getSubscriberId'],
			fieldPath: type,
			value: mappings
		}),
		cfLoadDestinationSets(rootGetters['user/getSubscriberId'])
	])
	commit('dataSucceeded', {
		mappings: res[0],
		destinationSets: res[1].items
	})
	dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
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
		resourceId: rootGetters['user/getSubscriberId'],
		fieldPath: payload.type,
		value: updatedMappings
	})
	await cfDeleteDestinationSet(payload.destinationset_id)
	const destinationSets = await cfLoadDestinationSets(rootGetters['user/getSubscriberId'])
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
		resourceId: rootGetters['user/getSubscriberId'],
		fieldPath: payload.type,
		value: updatedMappings
	})
	commit('dataSucceeded', {
		mappings: patchRes
	})
	dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function updateDestination ({ dispatch, commit, state, rootGetters }, payload) {
	dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
	const destinations = _.cloneDeep(state.destinationSetMap[payload.destinationSetId].destinations)
	destinations[payload.destinationIndex].destination = payload.destination
	await patchReplace({
		resource: 'cfdestinationsets',
		resourceId: payload.destinationSetId,
		fieldPath: 'destinations',
		value: destinations
	})
	const destinationSets = await cfLoadDestinationSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		destinationSets: destinationSets.items
	})
	dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function addDestination ({ dispatch, commit, state, rootGetters }, payload) {
	dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
	const destinations = _.cloneDeep(state.destinationSetMap[payload.destinationSetId].destinations)
	destinations.push(createDefaultDestination(payload.destination))
	await patchReplace({
		resource: 'cfdestinationsets',
		resourceId: payload.destinationSetId,
		fieldPath: 'destinations',
		value: destinations
	})
	const destinationSets = await cfLoadDestinationSets(rootGetters['user/getSubscriberId'])
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
				numbers: [destination]
			}
		})
		return req.result
	} catch (err) {
		return destination
	}
}

export async function removeDestination ({ dispatch, commit, state, rootGetters }, payload) {
	dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
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
	const destinationSets = await cfLoadDestinationSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		destinationSets: destinationSets.items
	})
	dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function updateDestinationTimeout ({ dispatch, commit, state, rootGetters }, payload) {
	dispatch('wait/start', WAIT_IDENTIFIER, { root: true })
	const destinations = _.cloneDeep(state.destinationSetMap[payload.destinationSetId].destinations)
	destinations[payload.destinationIndex].timeout = payload.destinationTimeout
	await patchReplace({
		resource: 'cfdestinationsets',
		resourceId: payload.destinationSetId,
		fieldPath: 'destinations',
		value: destinations
	})
	const destinationSets = await cfLoadDestinationSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		destinationSets: destinationSets.items
	})
	dispatch('wait/end', WAIT_IDENTIFIER, { root: true })
}

export async function loadSourceSets ({ dispatch, commit, rootGetters }) {
	dispatch('wait/start', 'csc-cf-sourcesets', { root: true })
	const sourceSets = await cfLoadSourceSets(rootGetters['user/getSubscriberId'])
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
			resourceId: rootGetters['user/getSubscriberId'],
			fieldPath: payload.mapping.type,
			value: updatedMapping
		})
		const sourceSets = await cfLoadSourceSets(rootGetters['user/getSubscriberId'])
		commit('dataSucceeded', {
			mappings: updatedMappings,
			sourceSets: sourceSets.items
		})
	} finally {
		dispatch('wait/end', 'csc-cf-source-set-create', { root: true })
	}
}

export async function updateSourceSet ({ dispatch, commit, rootGetters, state }, payload) {
	try {
		dispatch('wait/start', 'csc-cf-source-set-create', { root: true })
		await cfUpdateSourceSet(rootGetters['user/getSubscriberId'], payload)
		const sourceSets = await cfLoadSourceSets(rootGetters['user/getSubscriberId'])
		commit('dataSucceeded', {
			sourceSets: sourceSets.items
		})
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
			resourceId: rootGetters['user/getSubscriberId'],
			fieldPath: payload.mapping.type,
			value: updatedMapping
		})
		await cfDeleteSourceSet(payload.id)
		const sourceSets = await cfLoadSourceSets(rootGetters['user/getSubscriberId'])
		commit('dataSucceeded', {
			mappings: updatedMappings,
			sourceSets: sourceSets.items
		})
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
			resourceId: rootGetters['user/getSubscriberId'],
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
			resourceId: rootGetters['user/getSubscriberId'],
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
	updatedMapping[payload.mapping.index].timeset_id = timeSetId
	const updatedMappings = await patchReplaceFull({
		resource: 'cfmappings',
		resourceId: rootGetters['user/getSubscriberId'],
		fieldPath: payload.mapping.type,
		value: updatedMapping
	})
	const timeSets = await cfLoadTimeSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		mappings: updatedMappings,
		timeSets: timeSets.items
	})
	dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function updateTimeSetDate ({ dispatch, commit, rootGetters, state }, payload) {
	dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
	await cfUpdateTimeSetDate(payload.id, payload.date)
	const timeSets = await cfLoadTimeSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		timeSets: timeSets.items
	})
	dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function deleteTimeSet ({ dispatch, commit, rootGetters, state }, payload) {
	dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
	const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
	updatedMapping[payload.mapping.index].timeset_id = null
	updatedMapping[payload.mapping.index].timeset = null
	const updatedMappings = await patchReplaceFull({
		resource: 'cfmappings',
		resourceId: rootGetters['user/getSubscriberId'],
		fieldPath: payload.mapping.type,
		value: updatedMapping
	})
	await cfDeleteTimeSet(payload.id)
	const timeSets = await cfLoadTimeSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		mappings: updatedMappings,
		timeSets: timeSets.items
	})
	dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function ringPrimaryNumber ({ commit, rootGetters, state }) {
	const mappings = _.cloneDeep(state.mappings)
	mappings.cft = mappings.cfu
	mappings.cfu = []
	mappings.cft_ringtimeout = 60
	const updatedMappings = await put({
		resource: 'cfmappings',
		resourceId: rootGetters['user/getSubscriberId'],
		body: mappings
	})
	commit('dataSucceeded', {
		mappings: updatedMappings
	})
}

export async function doNotRingPrimaryNumber ({ commit, rootGetters, state }) {
	const mappings = _.cloneDeep(state.mappings)
	mappings.cfu = mappings.cft
	mappings.cft = []
	mappings.cft_ringtimeout = null
	const updatedMappings = await put({
		resource: 'cfmappings',
		resourceId: rootGetters['user/getSubscriberId'],
		body: mappings
	})
	commit('dataSucceeded', {
		mappings: updatedMappings
	})
}

export async function updateRingTimeout ({ commit, rootGetters, state }, ringTimeout) {
	const updatedMappings = await patchReplaceFull({
		resource: 'cfmappings',
		resourceId: rootGetters['user/getSubscriberId'],
		fieldPath: 'cft_ringtimeout',
		value: ringTimeout
	})
	commit('dataSucceeded', {
		mappings: updatedMappings
	})
}

export async function createTimeSetDateRange ({ dispatch, commit, rootGetters, state }, payload) {
	dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
	const timeSetId = await cfCreateTimeSetDateRange(rootGetters['user/getSubscriberId'], payload.date)
	const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
	updatedMapping[payload.mapping.index].timeset_id = timeSetId
	const updatedMappings = await patchReplaceFull({
		resource: 'cfmappings',
		resourceId: rootGetters['user/getSubscriberId'],
		fieldPath: payload.mapping.type,
		value: updatedMapping
	})
	const timeSets = await cfLoadTimeSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		mappings: updatedMappings,
		timeSets: timeSets.items
	})
	dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function updateTimeSetDateRange ({ dispatch, commit, rootGetters, state }, payload) {
	dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
	await cfUpdateTimeSetDateRange(payload.id, payload.date)
	const timeSets = await cfLoadTimeSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		timeSets: timeSets.items
	})
	dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function createTimeSetWeekdays ({ dispatch, commit, rootGetters, state }, payload) {
	dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
	const timeSetId = await cfCreateTimeSetWeekdays(rootGetters['user/getSubscriberId'], payload.weekdays)
	const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
	updatedMapping[payload.mapping.index].timeset_id = timeSetId
	const updatedMappings = await patchReplaceFull({
		resource: 'cfmappings',
		resourceId: rootGetters['user/getSubscriberId'],
		fieldPath: payload.mapping.type,
		value: updatedMapping
	})
	const timeSets = await cfLoadTimeSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		mappings: updatedMappings,
		timeSets: timeSets.items
	})
	dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function updateTimeSetWeekdays ({ dispatch, commit, rootGetters, state }, payload) {
	dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
	await cfUpdateTimeSetWeekdays(payload.id, payload.weekdays)
	const timeSets = await cfLoadTimeSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		timeSets: timeSets.items
	})
	dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function createOfficeHours ({ dispatch, commit, rootGetters, state }, payload) {
	dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
	const timeSetId = await cfCreateOfficeHours(rootGetters['user/getSubscriberId'], payload.times)
	const updatedMapping = _.cloneDeep(state.mappings[payload.mapping.type])
	updatedMapping[payload.mapping.index].timeset_id = timeSetId
	const updatedMappings = await patchReplaceFull({
		resource: 'cfmappings',
		resourceId: rootGetters['user/getSubscriberId'],
		fieldPath: payload.mapping.type,
		value: updatedMapping
	})
	if (payload.id) {
		await cfDeleteTimeSet(payload.id)
	}
	const timeSets = await cfLoadTimeSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		mappings: updatedMappings,
		timeSets: timeSets.items
	})
	dispatch('wait/end', 'csc-cf-time-set-create', { root: true })
}

export async function updateOfficeHours ({ dispatch, commit, rootGetters, state }, payload) {
	dispatch('wait/start', 'csc-cf-time-set-create', { root: true })
	await cfUpdateOfficeHours(payload.id, payload.times)
	const timeSets = await cfLoadTimeSets(rootGetters['user/getSubscriberId'])
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
		commit('setAnnouncements', {
			announcements: []
		})
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

export async function updateAnnouncement ({ dispatch, commit, rootGetters, state }, payload) {
	const destinations = _.cloneDeep(state.destinationSetMap[payload.destinationSetId].destinations)
	destinations[payload.destinationIndex].announcement_id = payload.announcementId
	await patchReplace({
		resource: 'cfdestinationsets',
		resourceId: payload.destinationSetId,
		fieldPath: 'destinations',
		value: destinations
	})
	const destinationSets = await cfLoadDestinationSets(rootGetters['user/getSubscriberId'])
	commit('dataSucceeded', {
		destinationSets: destinationSets.items
	})
}
