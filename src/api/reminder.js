import _ from 'lodash'
import {
    getList,
    httpApi,
    patchReplace
} from 'src/api/common'

export function createReminder (subscriberId) {
    return new Promise((resolve, reject) => {
        httpApi.post('api/reminders/', {
            subscriber_id: subscriberId,
            time: '00:00',
            recur: 'never',
            active: false
        }).then((result) => {
            const parts = result.headers.location.split('/')
            resolve(_.last(parts))
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getFirstReminder (subscriberId) {
    return new Promise((resolve, reject) => {
        getList({
            path: 'api/reminders/',
            root: '_embedded.ngcp:reminders',
            params: {
                page: 1,
                rows: 1,
                subscriber_id: subscriberId
            }
        }).then((reminders) => {
            resolve(_.get(reminders, 'items.0', null))
        }).catch((err) => {
            reject(err)
        })
    })
}

export function getReminder (subscriberId) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return getFirstReminder(subscriberId)
        }).then((reminder) => {
            if (reminder === null) {
                return createAndGetReminder(subscriberId)
            }
            return Promise.resolve(reminder)
        }).then((reminder) => {
            resolve(reminder)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function createAndGetReminder (subscriberId) {
    return new Promise((resolve, reject) => {
        Promise.resolve().then(() => {
            return createReminder(subscriberId)
        }).then(() => {
            return getFirstReminder(subscriberId)
        }).then((reminder) => {
            resolve(reminder)
        }).catch((err) => {
            reject(err)
        })
    })
}

export function setReminderActive (reminderId, active) {
    return patchReplace({
        path: `api/reminders/${reminderId}`,
        fieldPath: 'active',
        value: active
    })
}

export function setReminderTime (reminderId, time) {
    return patchReplace({
        path: `api/reminders/${reminderId}`,
        fieldPath: 'time',
        value: time
    })
}

export function setReminderRecurrence (reminderId, reccurence) {
    return patchReplace({
        path: `api/reminders/${reminderId}`,
        fieldPath: 'recur',
        value: reccurence
    })
}
