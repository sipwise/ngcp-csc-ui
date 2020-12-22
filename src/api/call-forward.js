
import _ from 'lodash'
import Vue from 'vue'
import { i18n } from 'src/boot/i18n'
import { getJsonBody } from './utils'
import { normalizeDestination } from '../filters/number-format'
import { LIST_ALL_ROWS, patchReplaceFull, get, getList, del } from './common'

export function getMappings (id) {
	return new Promise((resolve, reject) => {
		Vue.http.get('api/cfmappings/' + id).then((result) => {
			const jsonBody = getJsonBody(result.body)
			delete jsonBody._links
			delete jsonBody.cfs
			delete jsonBody.cfr
			resolve(getJsonBody(result.body))
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getSourcesets (id) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return Vue.http.get('api/cfsourcesets/',
				{ params: { subscriber_id: id, page: 1, rows: LIST_ALL_ROWS } })
		}).then((result) => {
			const totalCount = getJsonBody(result.body).total_count
			if (totalCount > LIST_ALL_ROWS) {
				return Vue.http.get('api/cfsourcesets/',
					{
						params: {
							subscriber_id: id,
							page: 1,
							rows: totalCount
						}
					})
			} else {
				return Promise.resolve(result)
			}
		}).then((result) => {
			let sourcesets = []
			if (getJsonBody(result.body)._embedded) {
				sourcesets = getJsonBody(result.body)._embedded['ngcp:cfsourcesets']
			}
			resolve(sourcesets)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getTimesets (id) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return Vue.http.get('api/cftimesets/',
				{ params: { subscriber_id: id, page: 1, rows: LIST_ALL_ROWS } })
		}).then((result) => {
			const totalCount = getJsonBody(result.body).total_count
			if (totalCount > LIST_ALL_ROWS) {
				return Vue.http.get('api/cftimesets/',
					{
						params: {
							subscriber_id: id,
							page: 1,
							rows: totalCount
						}
					})
			} else {
				return Promise.resolve(result)
			}
		}).then((result) => {
			const response = getJsonBody(result.body)._embedded || []
			const timesets = response['ngcp:cftimesets'] || []
			resolve(timesets)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getDestinationsets (id) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return Vue.http.get('api/cfdestinationsets/',
				{ params: { subscriber_id: id, page: 1, rows: LIST_ALL_ROWS } })
		}).then((result) => {
			const totalCount = getJsonBody(result.body).total_count
			if (totalCount > LIST_ALL_ROWS) {
				return Vue.http.get('api/cfdestinationsets/',
					{
						params: {
							subscriber_id: id,
							page: 1,
							rows: totalCount
						}
					})
			} else {
				return Promise.resolve(result)
			}
		}).then((result) => {
			if (getJsonBody(result.body)._embedded) {
				resolve(getJsonBody(result.body)._embedded['ngcp:cfdestinationsets'])
			} else {
				resolve([])
			}
		}).catch((err) => {
			reject(err)
		})
	})
}

export function loadDestinations (options) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return getSourcesets(options.subscriberId)
		}).then((sourcesets) => {
			const sourcesetsCollection = [{
				id: null,
				name: null
			}]
			const destinationPromises = []
			sourcesets.map((sourceset) => {
				sourcesetsCollection.push({
					id: sourceset.id,
					name: sourceset.name,
					mode: sourceset.mode
				})
			})
			sourcesetsCollection.forEach((sourceset) => {
				destinationPromises.push(
					getDestinationsBySourcesetId({
						timeset: options.timeset,
						sourceset_id: sourceset.id,
						sourceset_name: sourceset.name,
						subscriberId: options.subscriberId,
						sourceset_mode: sourceset.mode
					})
				)
			})
			resolve(Promise.all(destinationPromises))
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getDestinationsBySourcesetId (options) {
	return new Promise((resolve, reject) => {
		let cftTimeset = null
		let cfuTimeset = null
		let cfnaTimeset = null
		let cfbTimeset = null
		Promise.resolve().then(() => {
			return getMappings(options.subscriberId)
		}).then((mappings) => {
			const cftPromises = []
			const cfuPromises = []
			const cfnaPromises = []
			const cfbPromises = []
			if (_.has(mappings, 'cft') && _.isArray(mappings.cft) && mappings.cft.length > 0) {
				mappings.cft.forEach((cftMapping) => {
					if (cftMapping.timeset === options.timeset && cftMapping.sourceset_id === options.sourceset_id) {
						cftTimeset = cftMapping.timeset_id
						cftPromises.push(getDestinationsetById(cftMapping.destinationset_id))
					}
				})
			}
			if (_.has(mappings, 'cfu') && _.isArray(mappings.cfu) && mappings.cfu.length > 0) {
				mappings.cfu.forEach((cfuMapping) => {
					if (cfuMapping.timeset === options.timeset && cfuMapping.sourceset_id === options.sourceset_id) {
						cfuTimeset = cfuMapping.timeset_id
						cfuPromises.push(getDestinationsetById(cfuMapping.destinationset_id))
					}
				})
			}
			if (_.has(mappings, 'cfna') && _.isArray(mappings.cfna) && mappings.cfna.length > 0) {
				mappings.cfna.forEach((cfnaMapping) => {
					if (cfnaMapping.timeset === options.timeset && cfnaMapping.sourceset_id === options.sourceset_id) {
						cfnaTimeset = cfnaMapping.timeset_id
						cfnaPromises.push(getDestinationsetById(cfnaMapping.destinationset_id))
					}
				})
			}
			if (_.has(mappings, 'cfb') && _.isArray(mappings.cfb) && mappings.cfb.length > 0) {
				mappings.cfb.forEach((cfbMapping) => {
					if (cfbMapping.timeset === options.timeset && cfbMapping.sourceset_id === options.sourceset_id) {
						cfbTimeset = cfbMapping.timeset_id
						cfbPromises.push(getDestinationsetById(cfbMapping.destinationset_id))
					}
				})
			}
			return Promise.all([
				Promise.all(cftPromises),
				Promise.all(cfuPromises),
				Promise.all(cfnaPromises),
				Promise.all(cfbPromises)
			])
		}).then((result) => {
			const ownPhone = result[0].length > 0 && result[1].length === 0
			const cftDestinations = addNameIdOwnPhoneAndTerminating({ group: _.cloneDeep(result[0]), groupName: 'cft', timesetId: cftTimeset, ownPhone: ownPhone })
			const cfuDestinations = addNameIdOwnPhoneAndTerminating({ group: _.cloneDeep(result[1]), groupName: 'cfu', timesetId: cfuTimeset, ownPhone: ownPhone })
			const offlineDestinations = addNameIdOwnPhoneAndTerminating({ group: _.cloneDeep(result[2]), groupName: 'cfna', timesetId: cfnaTimeset, ownPhone: ownPhone })
			const busyDestinations = addNameIdOwnPhoneAndTerminating({ group: _.cloneDeep(result[3]), groupName: 'cfb', timesetId: cfbTimeset, ownPhone: ownPhone })
			const onlineDestinations = getOnlineDestinations({ cftDestinations: cftDestinations, cfuDestinations: cfuDestinations })
			resolve({
				sourcesetId: options.sourceset_id,
				sourcesetName: options.sourceset_name,
				sourcesetMode: options.sourceset_mode,
				ownPhone: ownPhone,
				destinationGroups: {
					online: onlineDestinations,
					offline: offlineDestinations,
					busy: busyDestinations
				}
			})
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getOnlineDestinations (options) {
	if (options.cftDestinations.length > 0 && options.cfuDestinations.length === 0) {
		return options.cftDestinations
	} else {
		return options.cfuDestinations
	}
}

export function addNameIdOwnPhoneAndTerminating (options) {
	let terminatingFlag = false
	options.group.forEach(destinationset => {
		destinationset.groupName = options.groupName
		destinationset.timesetId = options.timesetId
		destinationset.ownPhone = options.ownPhone
		destinationset.destinations.forEach(destination => {
			const normalized = normalizeDestination(destination.destination)

			if (!terminatingFlag && _.includes(['Voicebox', 'Fax2Mail', 'Manager Secretary',
				'Custom Announcement', 'Conference'], normalized)) {
				terminatingFlag = true
				destination.terminated = false
			} else if (terminatingFlag) {
				destination.terminated = true
			} else {
				destination.terminated = false
			}
		})
	})
	return options.group
}

export function getDestinationsetById (id) {
	return new Promise((resolve, reject) => {
		Vue.http.get('api/cfdestinationsets/' + id).then((res) => {
			const destinationset = getJsonBody(res.body)
			delete destinationset._links
			destinationset.destinations.sort((a, b) => {
				return parseFloat(a.priority) - parseFloat(b.priority)
			})
			resolve(destinationset)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function deleteDestinationFromDestinationset (options) {
	const headers = {
		'Content-Type': 'application/json-patch+json'
	}
	return new Promise((resolve, reject) => {
		Vue.http.patch('api/cfdestinationsets/' + options.id, [{
			op: 'replace',
			path: '/destinations',
			value: options.data
		}], { headers: headers }).then((result) => {
			if (options.deleteDestinationset) {
				deleteDestinationsetById(options.id).then((res) => {
					resolve(res)
				}).catch((err) => {
					reject(err)
				})
			} else {
				resolve(result)
			}
		}).catch((err) => {
			reject(err)
		})
	})
}

export function deleteDestinationsetById (id) {
	return new Promise((resolve, reject) => {
		Vue.http.delete('api/cfdestinationsets/' + id).then((result) => {
			resolve(result)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function updateDestinationsetName (options) {
	return patchReplaceFull({
		path: 'api/cfdestinationsets/' + options.id,
		fieldPath: 'name',
		value: options.name
	})
}

export function addDestinationToDestinationset (options) {
	return patchReplaceFull({
		path: 'api/cfdestinationsets/' + options.id,
		fieldPath: 'destinations',
		value: options.data
	})
}

export function addNewDestinationset () {
	const destinationsetName = `csc-${Date.now()}`
	return new Promise((resolve, reject) => {
		Vue.http.post('api/cfdestinationsets/', { name: destinationsetName })
			.then((response) => {
				resolve(_.last(_.split(response.headers.get('Location'), '/')))
			}).catch((err) => {
				reject(err)
			})
	})
}

export function addNewDestinationsetWithName (destinationsetName) {
	return new Promise((resolve, reject) => {
		Vue.http.post('api/cfdestinationsets/', { name: destinationsetName })
			.then((response) => {
				resolve(_.last(_.split(response.headers.get('Location'), '/')))
			}).catch((err) => {
				reject(err)
			})
	})
}

export function addDestinationToExistingGroup (options) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return getDestinationsetById(options.id)
		}).then((destinationset) => {
			const data = destinationset.destinations
			data.push(options.data)
			return addDestinationToDestinationset({
				id: options.id, data: data
			})
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function addDestinationToEmptyGroup (options) {
	return new Promise((resolve, reject) => {
		let destinationsetId
		Promise.resolve().then(() => {
			return addNewDestinationset()
		}).then((id) => {
			destinationsetId = id
			return addDestinationToDestinationset({
				id: id, data: [options.data]
			})
		}).then(() => {
			return getMappings(options.subscriberId)
		}).then((mappings) => {
			const updatedMappings = mappings[options.groupName]
			updatedMappings.push({
				destinationset_id: destinationsetId,
				sourceset_id: options.sourcesetId,
				timeset_id: options.timesetId
			})
			return addNewMapping({
				mappings: updatedMappings,
				group: options.groupName,
				subscriberId: options.subscriberId
			})
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function addNewMapping (options) {
	return patchReplaceFull({
		path: 'api/cfmappings/' + options.subscriberId,
		fieldPath: options.group,
		value: options.mappings
	})
}

export function addMultipleNewMappings (options) {
	return new Promise((resolve, reject) => {
		const headers = {
			'Content-Type': 'application/json-patch+json',
			Prefer: 'return=representation'
		}
		Vue.http.patch('api/cfmappings/' + options.subscriberId, options.mappings
			, { headers: headers }).then((result) => {
			resolve(getJsonBody(result.body))
		}).catch((err) => {
			reject(err)
		})
	})
}

export function changePositionOfDestination (options) {
	return new Promise((resolve, reject) => {
		const headers = { 'Content-Type': 'application/json-patch+json' }
		Vue.http.patch('api/cfdestinationsets/' + options.id, [{
			op: 'replace',
			path: '/destinations',
			value: options.destinations
		}], { headers: headers }).then((result) => {
			resolve(result)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function moveDestinationUp (options) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			const getPromises = []
			getPromises.push(getDestinationsetById(options.prevId))
			getPromises.push(getDestinationsetById(options.id))
			return Promise.all(getPromises)
		}).then((destinationsets) => {
			const updatePromises = []
			const lastDestinationPrevId = _.findLast(destinationsets[0].destinations) || {}
			const lowestPriorityPrevId = lastDestinationPrevId.priority || 1
			const prevDestinations = destinationsets[0].destinations
			const currentDestinations = destinationsets[1].destinations
			const prevDestinationsMoveToIndex = prevDestinations.length < 2
				? 1 : prevDestinations.length - 2
			options.destination.priority = lowestPriorityPrevId
			prevDestinations.splice(prevDestinationsMoveToIndex, 0, options.destination)
			currentDestinations.shift()
			updatePromises.push(addDestinationToDestinationset({
				id: options.prevId,
				data: prevDestinations
			}))
			updatePromises.push(deleteDestinationFromDestinationset({
				id: options.id,
				data: currentDestinations
			}))
			return Promise.all(updatePromises)
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function moveDestinationDown (options) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			const getPromises = []
			getPromises.push(getDestinationsetById(options.nextId))
			getPromises.push(getDestinationsetById(options.id))
			return Promise.all(getPromises)
		}).then((destinationsets) => {
			const updatePromises = []
			const firstDestinationNextId = _.head(destinationsets[0].destinations) || {}
			const highestPriorityNextId = firstDestinationNextId.priority || 1
			const nextDestinations = destinationsets[0].destinations
			const currentDestinations = destinationsets[1].destinations
			options.destination.priority = highestPriorityNextId
			nextDestinations.splice(1, 0, options.destination)
			currentDestinations.pop()
			updatePromises.push(addDestinationToDestinationset({
				id: options.nextId,
				data: nextDestinations
			}))
			updatePromises.push(deleteDestinationFromDestinationset({
				id: options.id,
				data: currentDestinations
			}))
			return Promise.all(updatePromises)
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getDaysFromRange (options) {
	let fromDay = options.fromDay
	const toDay = options.toDay + 1
	const wdayMap = {
		1: i18n.t('Sunday'),
		2: i18n.t('Monday'),
		3: i18n.t('Tuesday'),
		4: i18n.t('Wednesday'),
		5: i18n.t('Thursday'),
		6: i18n.t('Friday'),
		7: i18n.t('Saturday')
	}
	const days = []
	while (fromDay < toDay) {
		days.push({ name: wdayMap[fromDay], number: fromDay.toString() })
		fromDay++
	}
	return days
}

export function getHoursFromRange (options) {
	const toHour = options.toHour + 1
	const fromMinute = options.hasMinute ? options.fromMinute : '00'
	let toMinute = options.hasMinute ? options.toMinute + 1 : '00'
	toMinute = !toMinute ? fromMinute + 1 : toMinute
	const hours = []
	if (options.hasMinute) {
		while (options.fromHour < toHour) {
			hours.push({
				from: `${options.fromHour}:${fromMinute}`,
				to: `${options.fromHour}:${toMinute}`,
				hour: options.fromHour.toString()
			})
			options.fromHour++
		}
	} else {
		hours.push({
			from: `${options.fromHour}:${fromMinute}`,
			to: `${toHour}:${toMinute}`
		})
	}
	return hours
}

export function convertTimesetToWeekdays (options) {
	const times = []
	let counter = 0
	let timesetIsCompatible = true
	let timesetHasDuplicate = false
	let timesetExists = false
	let timesetHasReverse = false
	let timesetId = null
	options.timesets.forEach((timeset) => {
		const timesetNameMatches = timeset.name === options.timesetName
		if (counter === 0 && timesetNameMatches) {
			timeset.times.forEach((time) => {
				const isIncompatible = time.mday || time.month || time.year || !time.wday || !time.hour
				if (isIncompatible) {
					timesetIsCompatible = false
				} else {
					let days = []
					let hours = []
					const fromDay = parseInt(time.wday.split('-')[0])
					const toDay = time.wday.split('-')[1] ? parseInt(time.wday.split('-')[1]) : fromDay
					const fromHour = parseInt(time.hour.split('-')[0])
					const toHour = time.hour.split('-')[1] ? parseInt(time.hour.split('-')[1]) : fromHour
					const fromMinute = time.minute ? parseInt(time.minute.split('-')[0]) : undefined
					const toMinute = (time.minute && time.minute.split('-')[1]) ? parseInt(time.minute.split('-')[1]) : undefined
					const isReverse = fromDay > toDay || fromHour > toHour || fromMinute > toMinute
					let timesHour
					if (isReverse) {
						timesetHasReverse = true
					} else {
						hours = getHoursFromRange({
							hasMinute: !!time.minute,
							fromHour: fromHour,
							toHour: toHour,
							fromMinute: fromMinute,
							toMinute: toMinute
						})
						days = getDaysFromRange({ fromDay: fromDay, toDay: toDay })
						days.forEach(day => {
							hours.forEach(hour => {
								timesHour = time.minute ? hour.hour : time.hour
								times.push({
									weekday: day.name,
									from: hour.from,
									to: hour.to,
									wday: day.number,
									hour: timesHour,
									minute: time.minute
								})
							})
						})
						timesetId = timeset.id
						timesetIsCompatible = true
					}
				}
			})
			timesetId = timeset.id
			timesetExists = true
			counter++
		} else if (timesetNameMatches) {
			timesetHasDuplicate = true
		}
	})
	return {
		times: times,
		timesetIsCompatible: timesetIsCompatible,
		timesetExists: timesetExists,
		timesetHasReverse: timesetHasReverse,
		timesetHasDuplicate: timesetHasDuplicate,
		timesetId: timesetId
	}
}

function convertToTimes (times) {
	return times.reduce((timesConverted, time) => {
		const hourParts = time.hour.split('-')
		let minuteParts = null
		if (time.minute !== null && time.minute !== '') {
			minuteParts = time.minute.split('-')
		}
		if (hourParts.length === 1 && minuteParts === null) {
			timesConverted.push({
				from: normalizeTimePart(hourParts[0]) + ':00',
				to: normalizeTimePart(hourParts[0]) + ':00',
				weekday: parseInt(time.wday)
			})
		} else if (hourParts.length === 1 && minuteParts !== null && minuteParts.length === 1) {
			timesConverted.push({
				from: normalizeTimePart(hourParts[0]) + ':' + normalizeTimePart(minuteParts[0]),
				to: normalizeTimePart(hourParts[0]) + ':' + normalizeTimePart(minuteParts[0]),
				weekday: parseInt(time.wday)
			})
		} else if (hourParts.length === 1 && minuteParts !== null && minuteParts.length === 2) {
			timesConverted.push({
				from: normalizeTimePart(hourParts[0]) + ':' + normalizeTimePart(minuteParts[0]),
				to: normalizeTimePart(hourParts[0]) + ':' + normalizeTimePart(minuteParts[1]),
				weekday: parseInt(time.wday)
			})
		} else if (hourParts.length === 2 && minuteParts === null) {
			timesConverted.push({
				from: normalizeTimePart(hourParts[0]) + ':00',
				to: normalizeTimePart(hourParts[1]) + ':00',
				weekday: parseInt(time.wday)
			})
		} else if (hourParts.length === 2 && minuteParts !== null && minuteParts.length === 1) {
			timesConverted.push({
				from: normalizeTimePart(hourParts[0]) + ':' + normalizeTimePart(minuteParts[0]),
				to: normalizeTimePart(hourParts[1]) + ':' + normalizeTimePart(minuteParts[0]),
				weekday: parseInt(time.wday)
			})
		} else if (hourParts.length === 2 && minuteParts !== null && minuteParts.length === 2) {
			timesConverted.push({
				from: normalizeTimePart(hourParts[0]) + ':' + normalizeTimePart(minuteParts[0]),
				to: normalizeTimePart(hourParts[1]) + ':' + normalizeTimePart(minuteParts[1]),
				weekday: parseInt(time.wday)
			})
		} else if (hourParts.length === 2 && minuteParts !== null && minuteParts.length === 2) {
			timesConverted.push({
				from: normalizeTimePart(hourParts[0]) + ':' + normalizeTimePart(minuteParts[0]),
				to: normalizeTimePart(hourParts[1]) + ':' + normalizeTimePart(minuteParts[1]),
				weekday: parseInt(time.wday)
			})
		}
		return timesConverted
	}, [])
}

function normalizeTimePart (part) {
	if (part.length === 1) {
		return '0' + part
	} else {
		return part
	}
}

export async function loadTimesetTimes (options) {
	const timesets = await getTimesets(options.subscriberId)
	const filteredTimesets = timesets.filter(timeset => timeset.name === options.timeset)
	if (filteredTimesets.length === 1) {
		return {
			times: convertToTimes(filteredTimesets[0].times),
			timesetIsCompatible: true,
			timesetExists: filteredTimesets.length === 1,
			timesetHasReverse: false,
			timesetHasDuplicate: filteredTimesets.length > 1,
			timesetId: filteredTimesets[0].id
		}
	} else {
		return {
			times: [],
			timesetIsCompatible: true,
			timesetExists: false,
			timesetHasReverse: false,
			timesetHasDuplicate: false,
			timesetId: null
		}
	}
}

export async function appendTimeToTimeset (options) {
	const timeset = await get({
		resource: 'cftimesets',
		resourceId: options.timesetId
	})
	const times = _.cloneDeep(timeset.times)
	times.push(options.time)
	const updatedTimeset = await patchReplaceFull({
		resource: 'cftimesets',
		resourceId: options.timesetId,
		fieldPath: 'times',
		value: times
	})
	return {
		times: convertToTimes(updatedTimeset.times),
		timesetIsCompatible: true,
		timesetExists: true,
		timesetHasReverse: false,
		timesetHasDuplicate: false,
		timesetId: updatedTimeset.id
	}
}

/**
 * Removes a specific time from a given timeset
 * @param options
 * @param options.timesetId
 * @param options.timeId
 * @returns {Promise<void>}
 */
export async function deleteTimeFromTimeset (options) {
	const timeset = await get({
		resource: 'cftimesets',
		resourceId: options.timesetId
	})
	const updatedTimes = timeset.times.filter((time, index) => index !== options.timeId)
	if (updatedTimes.length === 0) {
		await del({
			resource: 'cftimesets',
			resourceId: options.timesetId
		})
		return {
			times: null,
			timesetIsCompatible: true,
			timesetExists: false,
			timesetHasReverse: false,
			timesetHasDuplicate: false,
			timesetId: null
		}
	} else {
		const updatedTimeset = await patchReplaceFull({
			resource: 'cftimesets',
			resourceId: options.timesetId,
			fieldPath: 'times',
			value: updatedTimes
		})
		return {
			times: convertToTimes(updatedTimeset.times),
			timesetIsCompatible: true,
			timesetExists: true,
			timesetHasReverse: false,
			timesetHasDuplicate: false,
			timesetId: updatedTimeset.id
		}
	}
}

export function deleteTimesetById (id) {
	return new Promise((resolve, reject) => {
		Vue.http.delete('api/cftimesets/' + id).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function resetTimesetByName (options) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return getTimesets(options.id)
		}).then((timesets) => {
			const deleteTimesetPromises = []
			_.filter(timesets, { name: options.name }).forEach((timeset) => {
				deleteTimesetPromises.push(deleteTimesetById(timeset.id))
			})
			return Promise.all(deleteTimesetPromises)
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function addTimeToTimeset (options) {
	return patchReplaceFull({
		path: 'api/cftimesets/' + options.id,
		fieldPath: 'times',
		value: options.times
	})
}

export function addNewTimeset (timesetName) {
	return new Promise((resolve, reject) => {
		Vue.http.post('api/cftimesets/', { name: timesetName })
			.then((response) => {
				resolve(_.last(_.split(response.headers.get('Location'), '/')))
			}).catch((err) => {
				reject(err)
			})
	})
}

export function convertAddTime (options) {
	const time = options.time
	const weekday = options.weekday
	const convertedTime = []
	const fromHour = time.from.split(':')[0]
	const toHour = time.to.split(':')[0]
	const fromMinute = time.from.split(':')[1]
	const toMinute = time.to.split(':')[1]
	const bothHasFullHour = fromMinute === '00' && toMinute === '00'
	const bothHasSameHour = fromHour === toHour
	const fromMinuteNotZero = time.from.split(':')[1] !== '00'
	const toMinuteNotZero = time.to.split(':')[1] !== '00'
	const bothMinutesNotZeroAndNextHourPlusOne = fromMinuteNotZero && toMinuteNotZero && parseInt(toHour) === parseInt(fromHour) + 1
	const bothMinutesNotZero = time.from.split(':')[1] !== '00' &&
        time.to.split(':')[1] !== '00'
	const startNotZeroAndEndNextFullHour =
        (parseInt(fromHour) === (parseInt(toHour) - 1) && toMinute === '00')
	if (bothHasFullHour) {
		convertedTime.push({ wday: weekday, hour: `${parseInt(fromHour)}-${parseInt(toHour) - 1}` })
	} else if (bothHasSameHour) {
		convertedTime.push({ wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-${parseInt(toMinute) - 1}` })
	} else if (startNotZeroAndEndNextFullHour) {
		convertedTime.push({ wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-59` })
	} else if (bothMinutesNotZeroAndNextHourPlusOne) {
		convertedTime.push(
			{ wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-59` },
			{ wday: weekday, hour: `${parseInt(toHour)}`, minute: `0-${parseInt(toMinute) - 1}` }
		)
	} else if (bothMinutesNotZero) {
		convertedTime.push(
			{ wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-59` },
			{ wday: weekday, hour: `${parseInt(fromHour) + 1}-${parseInt(toHour) - 1}` },
			{ wday: weekday, hour: `${parseInt(toHour)}`, minute: `0-${parseInt(toMinute) - 1}` }
		)
	} else if (fromMinuteNotZero) {
		convertedTime.push(
			{ wday: weekday, hour: `${parseInt(fromHour)}`, minute: `${parseInt(fromMinute)}-59` },
			{ wday: weekday, hour: `${parseInt(fromHour) + 1}-${parseInt(toHour) - 1}` }
		)
	} else if (toMinuteNotZero) {
		convertedTime.push(
			{ wday: weekday, hour: `${parseInt(fromHour) + 1}-${parseInt(toHour) - 1}` },
			{ wday: weekday, hour: `${parseInt(toHour)}`, minute: `0-${parseInt(toMinute) - 1}` }
		)
	}
	return convertedTime
}

export function createTimesetWithTime (options) {
	return new Promise((resolve, reject) => {
		const convertedTime = convertAddTime({ time: options.time[0], weekday: options.weekday })
		Promise.resolve().then(() => {
			return addNewTimeset(options.name)
		}).then((timesetId) => {
			return addTimeToTimeset({ id: timesetId, times: convertedTime })
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getTimesByTimesetId (id) {
	return new Promise((resolve, reject) => {
		Vue.http.get('api/cftimesets/' + id).then((res) => {
			const timeset = getJsonBody(res.body)
			delete timeset._links
			resolve(timeset.times)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getSourcesetById (id) {
	return new Promise((resolve, reject) => {
		Vue.http.get('api/cfsourcesets/' + id).then((res) => {
			const sourceset = getJsonBody(res.body)
			resolve(sourceset)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getSourcesBySourcesetId (id) {
	return new Promise((resolve, reject) => {
		Vue.http.get('api/cfsourcesets/' + id).then((res) => {
			const sourceset = getJsonBody(res.body)
			resolve(sourceset.sources)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function addSourceToSourceset (options) {
	return new Promise((resolve, reject) => {
		const headers = {
			'Content-Type': 'application/json-patch+json'
		}
		Vue.http.patch('api/cfsourcesets/' + options.id, [{
			op: 'replace',
			path: '/sources',
			value: options.sources
		}], { headers: headers }).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function appendSourceToSourceset (options) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return getSourcesBySourcesetId(options.id)
		}).then((sources) => {
			const concatSources = sources.concat(options.source)
			return addSourceToSourceset({ id: options.id, sources: concatSources })
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function createSourcesetWithSource (options) {
	return new Promise((resolve, reject) => {
		Vue.http.post('api/cfsourcesets/', {
			name: options.sourcesetName,
			subscriber_id: options.subscriberId,
			mode: options.mode,
			sources: [{
				source: options.source
			}]
		}).then((data) => {
			const id = data.headers.map.location[0].split('cfsourcesets/')[1]
			resolve(id)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function deleteSourcesetById (id) {
	return new Promise((resolve, reject) => {
		Vue.http.delete('api/cfsourcesets/' + id).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function deleteItemFromArrayByIndex (options) {
	return options.array.filter((item, index) => {
		return options.index !== index
	})
}

export function deleteSourceFromSourcesetByIndex (options) {
	return new Promise((resolve, reject) => {
		const sources = deleteItemFromArrayByIndex({
			array: options.sources,
			index: options.sourceIndex
		})
		const headers = {
			'Content-Type': 'application/json-patch+json'
		}
		Vue.http.patch('api/cfsourcesets/' + options.sourceset.sourcesetId, [{
			op: 'replace',
			path: '/sources',
			value: sources
		}], { headers: headers }).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function flipCfuAndCft (options) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return getMappings(options.subscriberId)
		}).then((mappings) => {
			const flipValues = mappings[options.fromType].filter((destinationset) => {
				return destinationset.sourceset_id === options.sourcesetId && destinationset.timeset_id === options.timesetId
			})
			const fromValues = mappings[options.fromType].filter((destinationset) => {
				return !(destinationset.sourceset_id === options.sourcesetId && destinationset.timeset_id === options.timesetId)
			})
			const toValues = mappings[options.toType].concat(flipValues)
			const patchOptions = [
				{
					op: 'replace',
					path: '/' + options.fromType,
					value: fromValues
				}, {
					op: 'replace',
					path: '/' + options.toType,
					value: toValues
				}
			]
			const timeoutOption = {
				op: 'replace',
				path: '/cft_ringtimeout',
				value: 15
			}
			if (!mappings.cft_ringtimeout) {
				patchOptions.push(timeoutOption)
			}
			return new Promise((resolve, reject) => {
				const headers = {
					'Content-Type': 'application/json-patch+json'
				}
				Vue.http.patch('api/cfmappings/' + options.subscriberId,
					patchOptions, { headers: headers }).then((result) => {
					resolve(result)
				}).catch((err) => {
					reject(err)
				})
			})
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getOwnPhoneTimeout (id) {
	return new Promise((resolve, reject) => {
		Vue.http.get('api/cfmappings/' + id).then((res) => {
			const timeout = getJsonBody(res.body).cft_ringtimeout
			resolve(timeout)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function updateOwnPhoneTimeout (options) {
	return patchReplaceFull({
		path: 'api/cfmappings/' + options.subscriberId,
		fieldPath: 'cft_ringtimeout',
		value: options.timeout
	})
}

export async function getCallForwardMappings (subscriberId) {
	return get({
		path: 'api/cfmappings/' + subscriberId
	})
}

export async function getCallForwardDestinationSets (subscriberId) {
	return getList({
		path: 'api/cfdestinationsets/' + subscriberId
	})
}

export async function getCallForwardSourceSets (subscriberId) {
	return getList({
		path: 'api/cfsourcesets/' + subscriberId
	})
}

export async function getCallForwardTimeSets (subscriberId) {
	return getList({
		path: 'api/cftimesets/' + subscriberId
	})
}
