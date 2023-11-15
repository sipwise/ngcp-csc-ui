
import _ from 'lodash'
import {
    getJsonBody
} from './utils'
import {
    getList,
    get,
    getAsBlob,
    patchAdd,
    patchReplace,
    patchRemove,
    patchReplaceFull,
    patchAddFull,
    httpApi
} from './common'

import {
    assignNumbers
} from './user'

export function getPreferences (id) {
    return new Promise((resolve, reject) => {
        httpApi.get('api/subscriberpreferences/' + id).then((result) => {
            resolve(getJsonBody(result.data))
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function getPreferencesDefs (id) {
    const result = await httpApi.get('api/subscriberpreferencedefs/')
    return getJsonBody(result.data)
}

export async function setPreference (id, field, value) {
    if (value === undefined || value === null || value === '' || value === false || (Array.isArray(value) && !value.length)) {
        await removePreference(id, field)
    } else {
        try {
            await replacePreference(id, field, value)
        } catch (err) {
            const errCode = err.status + ''
            if (errCode === '422') {
                // eslint-disable-next-line no-useless-catch
                try {
                    await addPreference(id, field, value)
                } catch (innerErr) {
                    throw innerErr
                }
            } else {
                throw err
            }
        }
    }
}
export async function setPreferencePhonebook (id, field, value) {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) {
        await removePreferencePhonebook(id, field)
    } else {
        try {
            await replacePreferencePhonebook(id, field, value)
        } catch (err) {
            const errCode = err.status + ''
            if (errCode === '422') {
                // eslint-disable-next-line no-useless-catch
                try {
                    await addPreferencePhonebook(id, field, value)
                } catch (innerErr) {
                    throw innerErr
                }
            } else {
                throw err
            }
        }
    }
}
export function getNcosLevels (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge(options, {
            path: 'api/ncoslevels/',
            root: '_embedded.ngcp:ncoslevels',
            all: true
        })
        getList(options).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}
export async function getNcosSet () {
    let streams = []
    const res = await httpApi.get('api/v2/ncos/sets/')
    if (res.data.total_count > 0) {
        streams = getJsonBody(res.data)._embedded['ngcp:ncos/sets']
    }
    return streams
}
export async function removePreference (id, field) {
    return await patchRemove({
        path: 'api/subscriberpreferences/' + id,
        fieldPath: field
    })
}
export async function removePreferencePhonebook (id, field) {
    return await patchRemove({
        path: 'api/subscriberphonebookentries/' + id,
        fieldPath: field
    })
}
export function addPreference (id, field, value) {
    return new Promise((resolve, reject) => {
        patchAdd({
            path: 'api/subscriberpreferences/' + id,
            fieldPath: field,
            value: value
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}
export function addPreferencePhonebook (id, field, value) {
    return new Promise((resolve, reject) => {
        patchAdd({
            path: 'api/subscriberphonebookentries/' + id,
            fieldPath: field,
            value: value
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}
export function addPreferenceFull (id, field, value) {
    return new Promise((resolve, reject) => {
        patchAddFull({
            path: 'api/subscriberpreferences/' + id,
            fieldPath: field,
            value: value
        }).then((preferences) => {
            resolve(preferences)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function replacePreference (id, field, value) {
    return new Promise((resolve, reject) => {
        patchReplace({
            path: 'api/subscriberpreferences/' + id,
            fieldPath: field,
            value: value
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}
export function replacePreferencePhonebook (id, field, value) {
    return new Promise((resolve, reject) => {
        patchReplace({
            path: 'api/subscriberphonebookentries/' + id,
            fieldPath: field,
            value: value
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}
export function prependItemToArrayPreference (id, field, value) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getPreferences(id)
        }).then((result) => {
            const prefs = _.cloneDeep(result)
            delete prefs._links
            prefs[field] = _.get(prefs, field, [])
            prefs[field] = [value].concat(prefs[field])
            return httpApi.put('api/subscriberpreferences/' + id, prefs)
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function appendItemToArrayPreference (id, field, value) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getPreferences(id)
        }).then((result) => {
            const prefs = _.cloneDeep(result)
            delete prefs._links
            prefs[field] = _.get(prefs, field, [])
            prefs[field].push(value)
            return httpApi.put('api/subscriberpreferences/' + id, prefs)
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function editItemInArrayPreference (id, field, itemIndex, value) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getPreferences(id)
        }).then((result) => {
            const prefs = _.cloneDeep(result)
            delete prefs._links
            if (_.isArray(prefs[field]) && itemIndex < prefs[field].length) {
                prefs[field][itemIndex] = value
                return httpApi.put('api/subscriberpreferences/' + id, prefs)
            } else {
                return Promise.reject(new Error('Array index does not exists'))
            }
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeItemFromArrayPreference (id, field, itemIndex) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getPreferences(id)
        }).then((result) => {
            const prefs = _.cloneDeep(result)
            delete prefs._links
            prefs[field] = _.get(prefs, field, [])
            _.remove(prefs[field], (value, index) => {
                return index === itemIndex
            })
            return httpApi.put('api/subscriberpreferences/' + id, prefs)
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setBlockInMode (id, value) {
    return setPreference(id, 'block_in_mode', value)
}

export function enableBlockIn (id) {
    return setBlockInMode(id, true)
}

export function disableBlockIn (id) {
    return setBlockInMode(id, false)
}

export function addToBlockInList (id, number) {
    return prependItemToArrayPreference(id, 'block_in_list', number)
}

export function editBlockInList (id, index, number) {
    return editItemInArrayPreference(id, 'block_in_list', index, number)
}

export function removeFromBlockInList (id, index) {
    return removeItemFromArrayPreference(id, 'block_in_list', index)
}

export function setBlockOutMode (id, value) {
    return setPreference(id, 'block_out_mode', value)
}

export function enableBlockOut (id) {
    return setBlockOutMode(id, true)
}

export function disableBlockOut (id) {
    return setBlockOutMode(id, false)
}

export function addToBlockOutList (id, number) {
    return prependItemToArrayPreference(id, 'block_out_list', number)
}

export function editBlockOutList (id, index, number) {
    return editItemInArrayPreference(id, 'block_out_list', index, number)
}

export function removeFromBlockOutList (id, index) {
    return removeItemFromArrayPreference(id, 'block_out_list', index)
}

export function setPrivacy (id, value) {
    return setPreference(id, 'clir', value)
}

export function enablePrivacy (id) {
    return setPrivacy(id, true)
}

export function disablePrivacy (id) {
    return setPrivacy(id, false)
}

export function createSubscriber (subscriber) {
    return new Promise((resolve, reject) => {
        httpApi.post('api/subscribers/', subscriber, {
            params: {
                customer_id: subscriber.customer_id
            }
        }).then((res) => {
            resolve(_.last(res.headers.location.split('/')))
        }).catch((err) => {
            if (err.response.status >= 400) {
                reject(new Error(err.response.data.message))
            } else {
                reject(err)
            }
        })
    })
}

export function deleteSubscriber (id) {
    return new Promise((resolve, reject) => {
        httpApi.delete('api/subscribers/' + id).then(() => {
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

export function setField (id, field, value) {
    return new Promise((resolve, reject) => {
        httpApi.patch('api/subscribers/' + id, [{
            op: 'replace',
            path: '/' + field,
            value: value
        }], {
            headers: {
                'Content-Type': 'application/json-patch+json',
                Prefer: 'return=minimal'
            }
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            if (err.response.status >= 400) {
                reject(new Error(err.response.data.message))
            } else {
                reject(err)
            }
        })
    })
}

export function setDisplayName (id, displayName) {
    return setField(id, 'display_name', displayName)
}

export function setWebUsername (id, webUsername) {
    return setField(id, 'webusername', webUsername)
}

export function setPbxExtension (id, pbxExtension) {
    return setField(id, 'pbx_extension', pbxExtension)
}

export function setPbxWebPassword (id, pbxWebPassword) {
    return setField(id, 'webpassword', pbxWebPassword)
}

export function setPbxSIPPassword (id, pbxWebPassword) {
    return setField(id, 'password', pbxWebPassword)
}

export function setPbxHuntPolicy (id, pbxHuntPolicy) {
    return setField(id, 'pbx_hunt_policy', pbxHuntPolicy)
}

export function setPbxHuntTimeout (id, pbxHuntTimeout) {
    return setField(id, 'pbx_hunt_timeout', pbxHuntTimeout)
}

export function setPbxHuntCancelMode (id, pbxHuntCancelMode) {
    return setField(id, 'pbx_hunt_cancel_mode', pbxHuntCancelMode)
}

export function setPbxGroupMemberIds (id, ids) {
    return setField(id, 'pbx_groupmember_ids', ids)
}

export function setPbxGroupIds (id, ids) {
    return setField(id, 'pbx_group_ids', ids)
}

export function setPreferenceIntraPbx (id, value) {
    return setPreference(id, 'clir_intrapbx', value)
}

export function setPreferenceMusicOnHold (id, value) {
    return setPreference(id, 'music_on_hold', value)
}

export function setPreferenceCli (id, value) {
    return setPreference(id, 'cli', value)
}

export function getSubscribers (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge(options, {
            path: 'api/subscribers/',
            root: '_embedded.ngcp:subscribers'
        })
        getList(options).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getFullSubscribers (options) {
    return new Promise((resolve, reject) => {
        let subscribers = {
            items: []
        }
        Promise.resolve().then(() => {
            return getSubscribers(options)
        }).then(($subscribers) => {
            subscribers = $subscribers
            const promises = []
            subscribers.items.forEach((subscriber) => {
                promises.push(getSubscriberPreference(subscriber.id))
            })
            return Promise.all(promises)
        }).then((preferences) => {
            resolve({
                subscribers: subscribers,
                preferences: preferences
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getSubscriber (id) {
    return new Promise((resolve, reject) => {
        get({
            path: 'api/subscribers/' + id
        }).then((subscriber) => {
            resolve(subscriber)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getSubscriberPreference (id) {
    return new Promise((resolve, reject) => {
        get({
            path: 'api/subscriberpreferences/' + id
        }).then((subscriberPreference) => {
            resolve(subscriberPreference)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setBlockAnonymous (id, value) {
    return setPreference(id, 'block_in_clir', value)
}

export function blockAnonymous (id) {
    return setBlockAnonymous(id, true)
}

export function allowAnonymous (id) {
    return setBlockAnonymous(id, false)
}

export function getSubscribersByCallQueueEnabled () {
    return new Promise((resolve, reject) => {
        let prefsByCallQueueEnabled = []
        Promise.resolve().then(() => {
            return getList({
                path: 'api/subscriberpreferences/',
                root: '_embedded.ngcp:subscriberpreferences',
                all: true
            })
        }).then((prefs) => {
            const subscriberPromises = []
            prefsByCallQueueEnabled = prefs.items.filter((pref) => {
                return pref.cloud_pbx_callqueue === true
            })
            prefsByCallQueueEnabled.forEach((pref) => {
                subscriberPromises.push(getSubscriber(pref.subscriber_id))
            })
            return Promise.all(subscriberPromises)
        }).then((subscribers) => {
            subscribers.forEach((subscriber, index) => {
                subscriber.prefs = prefsByCallQueueEnabled[index]
            })
            resolve(subscribers)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function addNewCallQueueConfig (id, config) {
    return httpApi.put('api/subscriberpreferences/' + id, config)
}

export function editCallQueuePreference (id, config) {
    return new Promise((resolve, reject) => {
        const $prefs = Object.assign(config, { cloud_pbx_callqueue: true })
        Promise.resolve().then(() => {
            return getPreferences(id)
        }).then((result) => {
            const prefs = Object.assign(result, $prefs)
            delete prefs._links
            return httpApi.put('api/subscriberpreferences/' + id, prefs)
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setQueueLength (id, queueLength) {
    return editCallQueuePreference(id, { max_queue_length: queueLength })
}

export function setWrapUpTime (id, wrapUpTime) {
    return editCallQueuePreference(id, { queue_wrap_up_time: wrapUpTime })
}

export function removeCallQueueConfig (subscriberId) {
    const param = { cloud_pbx_callqueue: false }
    return httpApi.put('api/subscriberpreferences/' + subscriberId, param)
}

export function getAllPreferences (options) {
    return new Promise((resolve, reject) => {
        options = options || {}
        options = _.merge(options, {
            path: 'api/subscriberpreferences/',
            root: '_embedded.ngcp:subscriberpreferences',
            all: true
        })
        getList(options).then((list) => {
            resolve(list)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getSubscriberAndPreferences (id) {
    return new Promise((resolve, reject) => {
        Promise.all([
            getSubscriber(id),
            getPreferences(id)
        ]).then((result) => {
            resolve({
                subscriber: result[0],
                preferences: result[1]
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setSubscriberNumbers (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return Promise.all([
                assignNumbers(options.assignedNumbers, options.subscriberId),
                assignNumbers(options.unassignedNumbers, options.pilotId)
            ])
        }).then(() => {
            if (options.assignedNumbers.length > 0) {
                return Promise.resolve({
                    subscriber: null,
                    preferences: null
                })
            } else {
                return getSubscriberAndPreferences(options.subscriberId)
            }
        }).then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function changePassword (subscriber, newPassword) {
    return new Promise((resolve, reject) => {
        patchReplaceFull({
            path: 'api/subscribers/' + subscriber,
            fieldPath: 'webpassword',
            value: newPassword
        }).then((subscriber) => {
            resolve(subscriber)
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function changeSIPPassword (subscriber, newPassword) {
    return patchReplaceFull({
        path: 'api/subscribers/' + subscriber,
        fieldPath: 'password',
        value: newPassword
    })
}

export async function resetPassword ({ username, domain = '' }) {
    const payLoad = {
        domain,
        type: 'subscriber',
        username
    }
    return await httpApi.post('api/passwordreset/', payLoad)
}

export async function recoverPassword (data) {
    const payLoad = {
        new_password: data.password,
        token: data.token
    }
    return await httpApi.post('api/passwordrecovery/', payLoad)
}

export async function getBrandingLogo (subscriberId) {
    const url = 'api/resellerbrandinglogos/?subscriber_id=' + subscriberId
    try {
        const res = await httpApi.get(url, {
            responseType: 'blob'
        })
        return URL.createObjectURL(res.data)
    } catch (err) {
        return null
    }
}

export async function getRecordings (options) {
    const data = { recordings: [], total_count: 0 }
    const res = await httpApi.get('api/callrecordings/', {
        params: options
    })
    if (res.data.total_count > 0) {
        const recordings = getJsonBody(res.data)._embedded['ngcp:callrecordings']
        data.recordings = recordings.map(recording => {
            return {
                id: recording.id,
                time: recording.start_time,
                caller: recording.caller,
                callee: recording.callee,
                files: []
            }
        })
        data.total_count = res.data.total_count
    }
    return data
}

export async function getRecordingStreams (recId) {
    let streams = []
    const res = await httpApi.get('api/callrecordingstreams/', {
        params: {
            recording_id: recId
        }
    })
    if (res.data.total_count > 0) {
        streams = getJsonBody(res.data)._embedded['ngcp:callrecordingstreams']
    }
    return streams
}

export async function downloadRecordingStream (fileId) {
    const res = await httpApi.get('api/callrecordingfiles/' + fileId, { responseType: 'blob' })
    return res.data
}

export async function getSubscriberRegistrations (options) {
    let all = false
    if (options.rows === 0) {
        delete options.rows
        delete options.page
        all = true
    }
    if (!options.order_by) {
        delete options.order_by
        delete options.order_by_direction
    }
    const list = await getList({
        resource: 'subscriberregistrations',
        all,
        params: options
    })
    return list
}
export async function getSubscriberPhonebook (options) {
    let all = false
    if (options.rows === 0) {
        delete options.rows
        delete options.page
        all = true
    }
    if (!options.order_by) {
        delete options.order_by
        delete options.order_by_direction
    }
    const list = await getList({
        resource: 'subscriberphonebookentries',
        all,
        params: options
    })
    return list
}
export async function createPhonebook (data) {
    const payLoad = {
        name: data.name,
        number: data.number,
        shared: data.shared
    }
    return await httpApi.post('api/subscriberphonebookentries/', payLoad)
}
export function setValueShared (id, value) {
    return setPreferencePhonebook(id, 'shared', value)
}
export function setValueName (id, value) {
    return setPreferencePhonebook(id, 'name', value)
}
export function setValueNumber (id, value) {
    return setPreferencePhonebook(id, 'number', value)
}
export async function getRecordingStream (fileId) {
    return await getAsBlob({
        path: 'api/callrecordingfiles/' + fileId
    })
}

export async function getSubscriberProfile (id) {
    const profile = await get({
        path: `api/subscriberprofiles/${id}`
    })
    return profile
}
