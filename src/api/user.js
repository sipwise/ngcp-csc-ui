
import _ from 'lodash'
import {
    get,
    post,
    getList,
    patchReplace,
    httpApi
} from './common'
import { getFaxServerSettings } from 'src/api/fax'
import { LICENSES } from 'src/constants'

export function login (username, password) {
    return new Promise((resolve, reject) => {
        let jwt = null
        let subscriberId = null
        httpApi.post('login_jwt', {
            username: username,
            password: password
        }).then((result) => {
            jwt = result.data.jwt
            subscriberId = result.data.subscriber_id + ''
            resolve({
                jwt: jwt,
                subscriberId: subscriberId
            })
        }).catch((err) => {
            if (err.response) {
                reject(new Error(err.response.data.message))
            } else {
                reject(err)
            }
        })
    })
}

export async function loginByExchangeToken (token) {
    try {
        const res = await httpApi.post('login_jwt', {
            token: token
        })
        return {
            jwt: res.data?.jwt,
            subscriberId: res.data?.subscriber_id + ''
        }
    } catch (err) {
        if (err.response.status && err.response.status >= 400) {
            throw new Error(err.response.data.message)
        } else {
            throw err
        }
    }
}

export async function getUserData (id) {
    const allPromise = Promise.all([
        getSubscriberById(id),
        getCapabilities(id),
        getResellerBranding(),
        getPlatformInfo()
    ])

    try {
        let isFaxServerSettingsActive = false
        const [subscriber, capabilities, resellerBranding, platformInfo] = await allPromise
        if (capabilities.faxserver && platformInfo.licenses.find((license) => license === LICENSES.fax)) {
            // Note that isFaxServerSettingsActive determines if the menu has been enabled by admin
            // or, in other words, if the relevant toggle is on/off.
            const responseFaxServerSettings = await getFaxServerSettings(id)
            isFaxServerSettingsActive = responseFaxServerSettings.active
        }

        return {
            subscriber,
            capabilities,
            resellerBranding: resellerBranding?.items[0] || null,
            platformInfo,
            isFaxServerSettingsActive
        }
    } catch (error) {
        throw new Error(error.response.data.message)
    }
}

export function getSubscriberById (id) {
    return new Promise((resolve, reject) => {
        get({
            path: 'api/subscribers/' + id
        }).then((body) => {
            resolve(body)
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * Determines if specific users should have access to features based on their roles and profiles.
 * Retrieves a list of capabilities and their enabled status from the API.
 * @returns {Promise<Object>} A promise that resolves to an object of capabilities with their enabled status
 */
export function getCapabilities () {
    return new Promise((resolve, reject) => {
        getList({
            path: 'api/capabilities/',
            root: '_embedded.ngcp:capabilities',
            all: true
        }).then((capabilityList) => {
            const capabilities = {}
            if (_.isArray(capabilityList.items)) {
                capabilityList.items.forEach((capability) => {
                    capabilities[capability.name] = capability.enabled
                })
            }
            resolve(capabilities)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function assignNumber (numberId, subscriberId) {
    return new Promise((resolve, reject) => {
        patchReplace({
            path: 'api/numbers/' + numberId,
            fieldPath: 'subscriber_id',
            value: subscriberId
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function assignNumbers (numberIds, subscriberId) {
    return new Promise((resolve, reject) => {
        if (_.isArray(numberIds) && numberIds.length > 0) {
            const assignNumberRequests = []
            numberIds.forEach((numberId) => {
                assignNumberRequests.push(assignNumber(numberId, subscriberId))
            })
            Promise.all(assignNumberRequests).then(() => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        } else {
            resolve()
        }
    })
}

export function getNumbers () {
    return new Promise((resolve, reject) => {
        getList({
            path: 'api/numbers/',
            root: '_embedded.ngcp:numbers',
            all: true
        }).then((numberList) => {
            resolve(numberList)
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function getResellerBranding () {
    return getList({
        resource: 'resellerbrandings'
    })
}

export async function getPlatformInfo () {
    return get({
        path: 'api/platforminfo'
    })
}

export async function createAuthToken (tokenExpiringTime) {
    const response = await post({
        resource: 'authtokens',
        body: {
            type: 'onetime',
            expires: tokenExpiringTime
        }
    })
    return response.token
}
