
import _ from 'lodash'
import { i18n } from 'boot/i18n'
import {
    get,
    post,
    getList,
    patchReplace,
    httpApi
} from './common'
import { getFaxServerSettings } from 'src/api/fax'

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

export async function getPreLoginPasswordInfo () {
    try {
        const res = await httpApi.get('api/platforminfo')
        return res.data.security.password
    } catch (err) {
        throw new Error(err.response.data.message)
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
        const [subscriber, capabilities, resellerBranding, platformInfo] = await allPromise
        if (capabilities.faxserver && platformInfo.licenses.find((license) => license === 'fax')) {
            const faxServerSettings = await getFaxServerSettings(id)
            capabilities.faxactive = faxServerSettings.active
        }

        return {
            subscriber,
            capabilities,
            resellerBranding: resellerBranding?.items[0] || null,
            platformInfo
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

export function changeExpiredPassword (payload) {
    return new Promise((resolve, reject) => {
        httpApi.post('/api/passwordchange/', {
            new_password: payload.new_password
        }, {
            auth: {
                username: payload.username,
                password: payload.old_password
            }
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            if (err.response.status === 401) {
                reject(`Unauthorized. ${i18n.global.tc('Wrong username or password')}`)
            } else if (err.response.status === 422) {
                reject(_formatPasswordError(err.response.data.message))
            } else {
                reject('Unexpected error')
            }
        })
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

function _formatPasswordError (error) {
    return error.split("'").slice(-2, -1)[0].replaceAll(',', ', ')
}
