import {
	getModel,
	getModelFrontImage,
	PBX_CONFIG_ORDER_BY,
	PBX_CONFIG_ORDER_DIRECTION
} from './pbx-config'
import _ from 'lodash'
import {
	getList,
	patchReplace,
	patchReplaceFull
} from './common'
import Vue from 'vue'

export function getDevices (options) {
	return new Promise((resolve, reject) => {
		options = options || {}
		options = _.merge(options, {
			path: 'api/pbxdevices/',
			root: '_embedded.ngcp:pbxdevices'
		})
		getList(options).then((list) => {
			resolve(list)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function getDeviceList (options) {
	return new Promise((resolve, reject) => {
		const params = {
			page: options.page,
			profile_id: options.profile_id,
			identifier: options.identifier,
			station_name: options.station_name,
			order_by: PBX_CONFIG_ORDER_BY,
			order_by_direction: PBX_CONFIG_ORDER_DIRECTION
		}
		if (params.profile_id === null || params.profile_id === undefined || params.profile_id === '') {
			delete params.profile_id
		}
		if (params.identifier === null || params.identifier === undefined || params.identifier === '') {
			delete params.identifier
		} else {
			params.identifier = '*' + params.identifier + '*'
		}
		if (params.station_name === null || params.station_name === undefined || params.station_name === '') {
			delete params.station_name
		} else {
			params.station_name = '*' + params.station_name + '*'
		}
		getDevices({
			params: params
		}).then((devices) => {
			resolve(devices)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function createDevice (deviceData) {
	return new Promise((resolve, reject) => {
		Vue.http.post('api/pbxdevices/', {
			station_name: deviceData.stationName,
			identifier: deviceData.identifier,
			profile_id: deviceData.profile
		}).then((res) => {
			resolve(res)
		}).catch((err) => {
			if (err.status >= 400) {
				reject(new Error(err.body.message))
			} else {
				reject(err)
			}
		})
	})
}

export function removeDevice (id) {
	return new Promise((resolve, reject) => {
		Vue.http.delete('api/pbxdevices/' + id).then(() => {
			resolve()
		}).catch((err) => {
			if (err.status >= 400) {
				reject(new Error(err.body.message))
			} else {
				reject(err)
			}
		})
	})
}

export function setDeviceStationName (deviceId, stationName) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return patchReplaceFull({
				path: 'api/pbxdevices/' + deviceId,
				fieldPath: 'station_name',
				value: stationName
			})
		}).then((device) => {
			resolve(device)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function setDeviceIdentifier (deviceId, identifier) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return patchReplaceFull({
				path: 'api/pbxdevices/' + deviceId,
				fieldPath: 'identifier',
				value: identifier
			})
		}).then((device) => {
			resolve(device)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function setDeviceProfile (deviceId, profileId) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return patchReplace({
				path: 'api/pbxdevices/' + deviceId,
				fieldPath: 'lines',
				value: []
			})
		}).then(() => {
			return patchReplaceFull({
				path: 'api/pbxdevices/' + deviceId,
				fieldPath: 'profile_id',
				value: profileId
			})
		}).then((device) => {
			resolve(device)
		}).catch((err) => {
			reject(err)
		})
	})
}

export function setDeviceKeys (deviceId, keys) {
	return new Promise((resolve, reject) => {
		Promise.resolve().then(() => {
			return patchReplaceFull({
				path: 'api/pbxdevices/' + deviceId,
				fieldPath: 'lines',
				value: keys
			})
		}).then((device) => {
			resolve(device)
		}).catch((err) => {
			reject(err)
		})
	})
}

export async function loadDeviceModel (modelId) {
	return new Promise((resolve, reject) => {
		Promise.all([
			getModel(modelId),
			getModelFrontImage(modelId)
		]).then((res) => {
			resolve({
				model: res[0],
				modelImage: res[1]
			})
		}).catch((err) => {
			reject(err)
		})
	})
}
