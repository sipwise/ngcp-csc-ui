import _ from 'lodash'
import {
    addPreference,
    addPreferenceFull,
    getAllPreferences,
    getSubscriber
} from 'src/api/subscriber'

export function getCallQueues () {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getAllPreferences({
                all: true
            })
        }).then((preferencesList) => {
            resolve({
                items: _.get(preferencesList, 'items', []).filter((preferences) => {
                    return _.get(preferences, 'cloud_pbx_callqueue', false)
                })
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getCallQueueList () {
    return new Promise((resolve, reject) => {
        let callQueues = []
        Promise.resolve().then(() => {
            return getCallQueues()
        }).then(($callQueues) => {
            callQueues = $callQueues
            const subscriberPromises = []
            callQueues.items.forEach((callQueue) => {
                subscriberPromises.push(getSubscriber(callQueue.id))
            })
            return Promise.all(subscriberPromises)
        }).then((subscribers) => {
            resolve({
                subscribers: {
                    items: subscribers
                },
                callQueues
            })
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * @param options.subscriber_id
 * @param options.max_queue_length
 * @param options.queue_wrap_up_time
 * @return {Promise}
 */
export function createCallQueue (options) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return Promise.all([
                addPreference(options.subscriber_id, 'cloud_pbx_callqueue', true),
                addPreference(options.subscriber_id, 'max_queue_length', options.max_queue_length),
                addPreference(options.subscriber_id, 'queue_wrap_up_time', options.queue_wrap_up_time)
            ])
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function removeCallQueue (subscriberId) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return addPreference(subscriberId, 'cloud_pbx_callqueue', false)
        }).then(() => {
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setCallQueueMaxLength (options) {
    return new Promise((resolve, reject) => {
        addPreferenceFull(options.callQueueId, 'max_queue_length', options.maxQueueLength).then((preferences) => {
            resolve(preferences)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setCallQueueWrapUpTime (options) {
    return new Promise((resolve, reject) => {
        addPreferenceFull(options.callQueueId, 'queue_wrap_up_time', options.queueWrapUpTime).then((preferences) => {
            resolve(preferences)
        }).catch((err) => {
            reject(err)
        })
    })
}
