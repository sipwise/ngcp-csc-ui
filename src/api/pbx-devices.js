import { PBX_CONFIG_ORDER_BY, PBX_CONFIG_ORDER_DIRECTION } from './pbx-config'
import _ from 'lodash'
import {
    get,
    getList,
    httpApi,
    patchAdd,
    patchRemove,
    patchReplace,
    patchReplaceFull
} from 'src/api/common'

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

export function getDevice (id) {
    return get({
        path: `api/pbxdevices/${id}`
    })
}
export function getDevicesPreferences (options) {
    return new Promise((resolve, reject) => {
        let requestOptions = options || {}
        requestOptions = _.merge(requestOptions, {
            path: 'api/pbxfielddevicepreferences/',
            root: '_embedded.ngcp:pbxfielddevicepreferences'
        })
        getList(requestOptions).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getDeviceList (options) {
    return new Promise((resolve, reject) => {
        const filters = options.filters || {}
        // normalize filters
        Object.keys(filters).forEach(key => {
            let value = filters[key]
            if (value === null || value === undefined || value === '') {
                delete filters[key]
            } else {
                switch (key) {
                case 'profile_id':
                    value = String(value)
                    break
                case 'identifier':
                case 'station_name':
                    value = '*' + value + '*'
                    break
                }
                filters[key] = value
            }
        })

        const params = {
            page: options.page,
            ...filters,
            order_by: PBX_CONFIG_ORDER_BY,
            order_by_direction: PBX_CONFIG_ORDER_DIRECTION
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
        httpApi.post('api/pbxdevices/', {
            station_name: deviceData.stationName,
            identifier: deviceData.identifier,
            profile_id: deviceData.profile
        }).then((res) => {
            resolve(res)
        }).catch((err) => {
            if (err.response.status >= 400) {
                reject(new Error(err.response.data.message))
            } else {
                reject(err)
            }
        })
    })
}

export function removeDevice (id) {
    return new Promise((resolve, reject) => {
        httpApi.delete('api/pbxdevices/' + id).then(() => {
            resolve()
        }).catch((err) => {
            if (err.response.status >= 400) {
                reject(new Error(err.response.data.message))
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

export function setPreferenceDevice (deviceId, deviceValue, fieldName) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            if (deviceValue === undefined || deviceValue === null || deviceValue === '' || (Array.isArray(deviceValue) && !deviceValue.length)) {
                return patchRemove({
                    path: 'api/pbxfielddevicepreferences/' + deviceId,
                    fieldPath: fieldName
                })
            }
            return patchReplaceFull({
                path: 'api/pbxfielddevicepreferences/' + deviceId,
                fieldPath: fieldName,
                value: deviceValue
            })
        }).then((device) => {
            resolve(device)
        }).catch((err) => {
            const errCode = err.status + ''
            if (errCode === '422') {
                return patchAdd({
                    path: 'api/pbxfielddevicepreferences/' + deviceId,
                    fieldPath: fieldName,
                    value: deviceValue
                })
            }
        }).then((device) => {
            resolve(device.data)
        }).catch((err) => {
            reject(err)
        })
    })
}
