import {
	del,
	get,
	getList, patchReplace, post, putMinimal
} from 'src/api/common'
import {
	v4
} from 'uuid'
import _ from 'lodash'

export async function cfLoadMappings (subscriberId) {
	return get({
		resource: 'cfmappings',
		resourceId: subscriberId
	})
}

export async function cfLoadDestinationSets (subscriberId) {
	return getList({
		resource: 'cfdestinationsets',
		all: true,
		params: {
			subscriber_id: subscriberId
		}
	})
}

export async function cfLoadSourceSets (subscriberId) {
	return getList({
		resource: 'cfsourcesets',
		params: {
			subscriber_id: subscriberId
		}
	})
}

export async function cfLoadTimeSets (subscriberId) {
	return getList({
		resource: 'cftimesets',
		params: {
			subscriber_id: subscriberId
		}
	})
}

export async function cfLoadMappingsFull (subscriberId) {
	return await Promise.all([
		cfLoadMappings(subscriberId),
		cfLoadDestinationSets(subscriberId),
		cfLoadSourceSets(subscriberId),
		cfLoadTimeSets(subscriberId)
	])
}

export async function cfCreateDestinationSet (payload) {
	return post({
		resource: 'cfdestinationsets',
		body: payload
	})
}

export async function cfDeleteDestinationSet (id) {
	return del({
		resource: 'cfdestinationsets',
		resourceId: id
	})
}

export async function cfCreateSourceSet (id, payload) {
	const sources = []
	payload.numbers.forEach((number) => {
		sources.push({
			source: number
		})
	})
	const res = await post({
		resource: 'cfsourcesets',
		body: {
			name: payload.name,
			subscriber_id: id,
			is_regex: true,
			sources: sources,
			mode: payload.mode
		}
	})
	if (!_.isString(res)) {
		return res.id + ''
	} else {
		return res
	}
}

export async function cfUpdateSourceSet (id, payload) {
	const sources = []
	payload.numbers.forEach((number) => {
		sources.push({
			source: number
		})
	})
	return putMinimal({
		resource: 'cfsourcesets',
		resourceId: payload.id,
		body: {
			name: payload.name,
			subscriber_id: id,
			is_regex: true,
			sources: sources,
			mode: payload.mode
		}
	})
}

export async function cfDeleteSourceSet (id) {
	return del({
		resource: 'cfsourcesets',
		resourceId: id
	})
}

export async function cfCreateTimeSetDate (subscriberId, date) {
	return post({
		resource: 'cftimesets',
		body: {
			subscriber_id: subscriberId,
			name: 'csc-date-exact-' + v4(),
			times: [
				{
					minute: null,
					month: date.month,
					hour: null,
					mday: date.date,
					year: date.year,
					wday: null
				}
			]
		}
	})
}

export async function cfUpdateTimeSetDate (timeSetId, date) {
	return patchReplace({
		resource: 'cftimesets',
		resourceId: timeSetId,
		fieldPath: 'times',
		value: [
			{
				minute: null,
				month: date.month,
				hour: null,
				mday: date.date,
				year: date.year,
				wday: null
			}
		]
	})
}

export async function cfDeleteTimeSet (timesetId) {
	return del({
		resource: 'cftimesets',
		resourceId: timesetId
	})
}

export async function cfCreateTimeSetDateRange (subscriberId, times) {
	return post({
		resource: 'cftimesets',
		body: {
			subscriber_id: subscriberId,
			name: 'csc-date-range-' + v4(),
			times: times
		}
	})
}

export async function cfUpdateTimeSetDateRange (timeSetId, times) {
	return patchReplace({
		resource: 'cftimesets',
		resourceId: timeSetId,
		fieldPath: 'times',
		value: times
	})
}

export async function cfCreateTimeSetWeekdays (subscriberId, weekdays) {
	const times = []
	weekdays.forEach((weekday) => {
		times.push({
			minute: null,
			month: null,
			hour: null,
			mday: null,
			year: null,
			wday: weekday
		})
	})
	return post({
		resource: 'cftimesets',
		body: {
			subscriber_id: subscriberId,
			name: 'csc-weekdays-' + v4(),
			times: times
		}
	})
}

export async function cfUpdateTimeSetWeekdays (timeSetId, weekdays) {
	const times = []
	weekdays.forEach((weekday) => {
		times.push({
			minute: null,
			month: null,
			hour: null,
			mday: null,
			year: null,
			wday: weekday
		})
	})
	return patchReplace({
		resource: 'cftimesets',
		resourceId: timeSetId,
		fieldPath: 'times',
		value: times
	})
}

export async function cfCreateOfficeHours (subscriberId, times) {
	return post({
		resource: 'cftimesets',
		body: {
			subscriber_id: subscriberId,
			name: 'csc-office-hours-' + v4(),
			times: times
		}
	})
}

export async function cfUpdateOfficeHours (timeSetId, times) {
	return patchReplace({
		resource: 'cftimesets',
		resourceId: timeSetId,
		fieldPath: 'times',
		value: times
	})
}
