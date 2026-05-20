import _ from 'lodash'
import {
    addPreferenceFull,
    getAllPreferences,
    getSubscriber,
    removeCallQueueConfig,
    setPreference
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

export async function getCallQueueList () {
    const callQueues = await getCallQueues()
    const subscribers = await Promise.all(
        callQueues.items.map((callQueue) => getSubscriber(callQueue.subscriber_id))
    )
    return {
        subscribers: {
            items: subscribers
        },
        callQueues
    }
}

export async function createCallQueue ({ subscriberId, maxQueueLength, queueWrapUpTime }) {
    await Promise.all([
        setPreference(subscriberId, 'cloud_pbx_callqueue', true),
        setPreference(subscriberId, 'max_queue_length', maxQueueLength),
        setPreference(subscriberId, 'queue_wrap_up_time', queueWrapUpTime)
    ])
}

export async function removeCallQueue (callQueueId) {
    await removeCallQueueConfig(callQueueId)
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
