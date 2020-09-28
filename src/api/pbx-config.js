
import _ from 'lodash'
import Vue from 'vue'
import {
	getSubscribers
} from './subscriber'
import uuid from 'uuid'
import {
	getList,
	get,
	patchAdd,
	patchRemove
} from './common'

export const createId = uuid.v4
export const PBX_CONFIG_ORDER_BY = 'create_timestamp'
export const PBX_CONFIG_ORDER_DIRECTION = 'desc'

export function getPilot (options) {
	return new Promise((resolve, reject) => {
		options = options || {}
		options = _.merge(options, {
			params: {
				is_pbx_group: 0,
				is_pbx_pilot: 1,
				rows: 1
			}
		})
		getSubscribers(options).then((subscribers) => {
			if (subscribers.items.length === 1) {
				resolve(subscribers.items[0])
			} else {
				resolve(null)
			}
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getProfiles (options) {
	return new Promise((resolve, reject) => {
		options = options || {}
		options = _.merge(options, {
			path: 'api/pbxdeviceprofiles/',
			root: '_embedded.ngcp:pbxdeviceprofiles'
		})
		getList(options).then((list) => {
			resolve(list)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getAllProfiles () {
	return getProfiles({
		all: true
	})
}

export function getModel (id) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return get({
				path: 'api/pbxdevicemodels/' + id
			})
		}).then((model) => {
			resolve(model)
		}).catch((err) => {
			reject(err)
		})
	})
}

export async function getModelImage (id, type) {
	try {
		const res = await Vue.http.get('api/pbxdevicemodelimages/' + id, {
			responseType: 'blob',
			params: {
				type: type
			}
		})
		return {
			id: id,
			url: URL.createObjectURL(res.body),
			blob: res.body
		}
	} catch (err) {
		return {
			id: id,
			url: null,
			blob: null
		}
	}
}

export async function getModelFrontImage (id) {
	return getModelImage(id, 'front')
}

export async function getModelFrontThumbnailImage (id) {
	return getModelImage(id, 'front_thumb')
}

export function getAllSoundSets (options) {
	return new Promise((resolve, reject) => {
		options = options || {}
		options = _.merge(options, {
			path: 'api/soundsets/',
			root: '_embedded.ngcp:soundsets',
			all: true
		})
		getList(options).then((list) => {
			resolve(list)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function removeSoundSet (id) {
	return Vue.http.delete('api/soundsets/' + id)
}

export function getSoundSet (id) {
	return new Promise((resolve, reject) => {
		get({
			path: 'api/soundsets/' + id
		}).then((soundSet) => {
			resolve(soundSet)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function editSoundSetFields (id, fields) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return getSoundSet(id)
		}).then((result) => {
			const prefs = Object.assign(result, fields)
			delete fields._links
			return Vue.http.put('api/soundsets/' + id, prefs)
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function createSoundSet (soundSet) {
	return new Promise((resolve, reject) => {
		Vue.http.post('api/soundsets/', soundSet).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function setSoundSetName (id, value) {
	return editSoundSetFields(id, { name: value })
}

export function setSoundSetDescription (id, value) {
	return editSoundSetFields(id, { description: value })
}

export function playSoundFile (options) {
	return new Promise((resolve, reject) => {
		const params = { format: options.format }
		Vue.http.get(`api/soundfilerecordings/${options.id}`, { params: params, responseType: 'blob' })
			.then((res) => {
				resolve(URL.createObjectURL(res.body))
			}).catch((err) => {
				reject(err)
			})
	})
}

export function uploadSoundFile (options, onProgress) {
	return new Promise((resolve, reject) => {
		const formData = new FormData()
		const loopplay = options.item.loopplay ? 1 : 2
		const fields = {
			loopplay: loopplay,
			filename: options.file.name,
			set_id: options.item.set_id,
			handle: options.item.handle
		}
		const json = JSON.stringify(fields)
		const requestKey = `previous-${options.item.handle}-request`
		formData.append('json', json)
		if (options.file) {
			formData.append('soundfile', options.file)
		}
		Vue.http.post('api/soundfiles/', formData, {
			before (request) {
				Vue[requestKey] = request
			},
			progress (e) {
				if (e.lengthComputable) {
					onProgress(Math.ceil((e.loaded / e.total) * 100))
				}
			}
		}).then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}

export function setSubscriberSoundSet (id, soundSet) {
	return new Promise((resolve, reject) => {
		let promise
		const path = 'api/subscriberpreferences/' + id
		const fieldPath = 'contract_sound_set'
		if (soundSet === null || soundSet === undefined) {
			promise = patchRemove({
				path: path,
				fieldPath: 'contract_sound_set'
			})
		} else {
			promise = patchAdd({
				path: path,
				fieldPath: fieldPath,
				value: soundSet
			})
		}
		promise.then(() => {
			resolve()
		}).catch((err) => {
			reject(err)
		})
	})
}
