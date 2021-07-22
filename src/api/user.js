
import _ from 'lodash'
import Vue from 'vue'
import {
    get,
    post,
    getList,
    patchReplace
} from './common'
import { getFaxServerSettings } from 'src/api/fax'

export function login (username, password) {
    return new Promise((resolve, reject) => {
        let jwt = null
        let subscriberId = null
        Vue.http.post('login_jwt', {
            username: username,
            password: password
        }).then((result) => {
            jwt = result.body.jwt
            subscriberId = result.body.subscriber_id + ''
            resolve({
                jwt: jwt,
                subscriberId: subscriberId
            })
        }).catch((err) => {
            if (err.status && err.status >= 400) {
                reject(new Error(err.body.message))
            } else {
                reject(err)
            }
        })
    })
}

export async function loginByExchangeToken (token) {
    try {
        const res = await Vue.http.post('login_jwt', {
            token: token
        })
        return {
            jwt: res.body?.jwt,
            subscriberId: res.body?.subscriber_id + ''
        }
    } catch (err) {
        if (err.status && err.status >= 400) {
            throw new Error(err.body.message)
        } else {
            throw err
        }
    }
}

export function getUserData (id) {
    return new Promise((resolve, reject) => {
        return Promise.all([
            getSubscriberById(id),
            getCapabilities(id),
            getFaxServerSettings(id),
            getResellerBranding(),
            getPlatformInfo()
        ]).then(([subscriber, capabilities, faxServerSettings, resellerBranding, platformInfo]) => {
            capabilities.faxactive = faxServerSettings.active
            resolve({
                subscriber,
                capabilities,
                resellerBranding: resellerBranding?.items[0] || null,
                platformInfo
            })
        }).catch((err) => {
            reject(err)
        })
    })
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
