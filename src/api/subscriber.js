
import _ from 'lodash'
import Vue from 'vue'
import {
    getJsonBody
} from './utils'
import {
    getList,
    get,
    patchAdd,
    patchReplace,
    patchRemove,
    patchReplaceFull,
    patchAddFull

} from './common'
import {
    assignNumbers
} from './user'
export function getPreferences (id) {
    return new Promise((resolve, reject) => {
        Vue.http.get('api/subscriberpreferences/' + id).then((result) => {
            resolve(getJsonBody(result.body))
        }).catch((err) => {
            reject(err)
        })
    })
}

export async function getPreferencesDefs (id) {
    const result = await Vue.http.get('api/subscriberpreferencedefs/')
    return getJsonBody(result.body)
}

export async function setPreference (id, field, value) {
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

export async function removePreference (id, field) {
    return await patchRemove({
        path: 'api/subscriberpreferences/' + id,
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

export function prependItemToArrayPreference (id, field, value) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getPreferences(id)
        }).then((result) => {
            const prefs = _.cloneDeep(result)
            delete prefs._links
            prefs[field] = _.get(prefs, field, [])
            prefs[field] = [value].concat(prefs[field])
            return Vue.http.put('api/subscriberpreferences/' + id, prefs)
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
            var prefs = _.cloneDeep(result)
            delete prefs._links
            prefs[field] = _.get(prefs, field, [])
            prefs[field].push(value)
            return Vue.http.put('api/subscriberpreferences/' + id, prefs)
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
                return Vue.http.put('api/subscriberpreferences/' + id, prefs)
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
            return Vue.http.put('api/subscriberpreferences/' + id, prefs)
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
        Vue.http.post('api/subscribers/', subscriber, {
            params: {
                customer_id: subscriber.customer_id
            }
        }).then((res) => {
            resolve(_.last(_.split(res.headers.get('Location'), '/')))
        }).catch((err) => {
            if (err.status >= 400) {
                reject(new Error(err.body.message))
            } else {
                reject(err)
            }
        })
    })
}

export function deleteSubscriber (id) {
    return new Promise((resolve, reject) => {
        Vue.http.delete('api/subscribers/' + id).then(() => {
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

export function setField (id, field, value) {
    return new Promise((resolve, reject) => {
        Vue.http.patch('api/subscribers/' + id, [{
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
            if (err.status >= 400) {
                reject(new Error(err.body.message))
            } else {
                reject(err)
            }
        })
    })
}

export function setDisplayName (id, displayName) {
    return setField(id, 'display_name', displayName)
}

export function setPbxExtension (id, pbxExtension) {
    return setField(id, 'pbx_extension', pbxExtension)
}

export function setPbxWebPassword (id, pbxWebPassword) {
    return setField(id, 'webpassword', pbxWebPassword)
}

export function setPbxHuntPolicy (id, pbxHuntPolicy) {
    return setField(id, 'pbx_hunt_policy', pbxHuntPolicy)
}

export function setPbxHuntTimeout (id, pbxHuntTimeout) {
    return setField(id, 'pbx_hunt_timeout', pbxHuntTimeout)
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
    return Vue.http.put('api/subscriberpreferences/' + id, config)
}

export function editCallQueuePreference (id, config) {
    return new Promise((resolve, reject) => {
        const $prefs = Object.assign(config, { cloud_pbx_callqueue: true })
        Promise.resolve().then(() => {
            return getPreferences(id)
        }).then((result) => {
            const prefs = Object.assign(result, $prefs)
            delete prefs._links
            return Vue.http.put('api/subscriberpreferences/' + id, prefs)
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
    return Vue.http.put('api/subscriberpreferences/' + subscriberId, param)
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

export async function resetPassword (userName) {
    const payLoad = {
        domain: Vue.$config.baseHttpUrl.replace(/(^\w+:|^)\/\//, ''),
        type: 'subscriber',
        username: userName
    }
    return await Vue.http.post('api/passwordreset/', payLoad)
}

export async function recoverPassword (data) {
    const payLoad = {
        new_password: data.password,
        token: data.token
    }
    return await Vue.http.post('api/passwordrecovery/', payLoad)
}

export async function getBrandingLogo (subscriberId) {
    const url = 'api/resellerbrandinglogos/?subscriber_id=' + subscriberId
    try {
        const res = await Vue.http.get(url, {
            responseType: 'blob'
        })
        return URL.createObjectURL(res.body)
    } catch (err) {
        return null
    }
}

export async function getRecordings (options) {
    const data = { recordings: [], total_count: 0 }
    const res = await Vue.http.get('api/callrecordings/', {
        params: options
    })
    if (res.body.total_count > 0) {
        const recordings = getJsonBody(res.body)._embedded['ngcp:callrecordings']
        data.recordings = recordings.map(recording => {
            return {
                id: recording.id,
                time: recording.start_time,
                files: []
            }
        })
        data.total_count = res.body.total_count
    }
    return data
}

export async function getRecordingStreams (recId) {
    let streams = []
    const res = await Vue.http.get('api/callrecordingstreams/', {
        params: {
            recording_id: recId
        }
    })
    if (res.body.total_count > 0) {
        streams = getJsonBody(res.body)._embedded['ngcp:callrecordingstreams']
    }
    return streams
}

export async function downloadRecordingStream (fileId) {
    const res = await Vue.http.get('api/callrecordingfiles/' + fileId, { responseType: 'blob' })
    return res.body
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
