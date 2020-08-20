
import _ from 'lodash'
import Vue from 'vue'
import { i18n } from 'src/boot/i18n'
import { getFieldList } from './common'

export function getSpeedDialsById (id) {
	return new Promise((resolve, reject) => {
		getFieldList({
			path: 'api/speeddials/' + id,
			field: 'speeddials'
		}).then((result) => {
			const sortedResult = _.sortBy(result, ['slot'])
			resolve(sortedResult)
		}).catch((err) => {
			reject(err.body.message)
		})
	})
}

export function getUnassignedSlots (id) {
	return new Promise((resolve, reject) => {
		const slots = ['*0', '*1', '*2', '*3', '*4', '*5', '*6', '*7', '*8', '*9']
		Promise.resolve().then(() => {
			return getSpeedDialsById(id)
		}).then((assignedSlots) => {
			const unassignedSlots = _.difference(slots, assignedSlots.map((slot) => {
				return slot.slot
			}))
			const slotOptions = []
			unassignedSlots.forEach((slot) => {
				slotOptions.push({
					label: `${i18n.t('speedDial.slot')} ${slot}`,
					value: slot
				})
			})
			resolve(slotOptions)
		}).catch((err) => {
			reject(err.body.message)
		})
	})
}

export function unassignSpeedDialSlot (options) {
	return new Promise((resolve, reject) => {
		const updatedAssignedSlots = _.without(options.slots, options.slot)
		const headers = {
			'Content-Type': 'application/json-patch+json'
		}
		Vue.http.patch('api/speeddials/' + options.id, [{
			op: 'replace',
			path: '/speeddials',
			value: updatedAssignedSlots
		}], { headers: headers }).then(() => {
			resolve()
		}).catch((err) => {
			reject(err.body.message)
		})
	})
}

export function addSlotToSpeedDials (options) {
	return new Promise((resolve, reject) => {
		const headers = {
			'Content-Type': 'application/json-patch+json'
		}
		Vue.http.patch('api/speeddials/' + options.id, [{
			op: 'replace',
			path: '/speeddials',
			value: options.slots
		}], { headers: headers }).then(() => {
			resolve()
		}).catch((err) => {
			reject(err.body.message)
		})
	})
}

export function assignSpeedDialSlot (options) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return getSpeedDialsById(options.id)
		}).then((result) => {
			const concatSlots = result.concat(options.slot)
			return addSlotToSpeedDials({ id: options.id, slots: concatSlots })
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}
