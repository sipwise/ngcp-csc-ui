import _ from 'lodash'
import {
    Loading,
    Notify
} from 'quasar'
import {
    Alert
} from 'src/quasar-legacy'
import {
    i18n
} from 'src/boot/i18n'
import CscSpinner from 'components/CscSpinner'

export function startLoading () {
    Loading.show({
        delay: 0,
        spinner: CscSpinner
    })
}

export function stopLoading () {
    Loading.hide()
}

export function showGlobalError (messageOrException, timeout = 3000) {
    let errorMessage = messageOrException
    if (typeof messageOrException === 'object') {
        // trying to get error message from the Axios response otherwise from the error itself
        errorMessage = messageOrException?.response?.data?.message || messageOrException?.message
    }
    if (errorMessage === '' || errorMessage === undefined || errorMessage === null) {
        errorMessage = i18n.global.t('Unknown error')
    }
    return Notify.create({
        message: errorMessage,
        position: 'top',
        type: 'negative',
        icon: 'error',
        textColor: 'dark',
        enter: 'bounceIn',
        leave: 'fadeOut',
        timeout
    })
}

export function showGlobalWarning (message, timeout) {
    Alert.create({
        html: message,
        position: 'top-center',
        enter: 'bounceIn',
        leave: 'fadeOut',
        color: 'warning'
    })
}

export function showPermanentGlobalWarning (message) {
    Alert.create({
        html: message,
        position: 'top-center',
        enter: 'bounceIn',
        leave: 'fadeOut',
        color: 'warning'
    })
}

export function showToast (message) {
    Notify.create({
        textColor: 'dark',
        color: 'primary',
        message: message,
        position: 'top'
    })
}

export function askForNotificationPermission () {
    return new Promise((resolve, reject) => {
        if (_.isObject(Notification)) {
            Notification.requestPermission().then((perms) => {
                if (perms === 'denied' || perms === 'default') {
                    showPermanentGlobalWarning(i18n.global.t('You have blocked incoming call notifications.'))
                }
                resolve()
            }).catch((err) => {
                reject(err)
            })
        } else {
            showPermanentGlobalWarning(i18n.global.t('Incoming call notifications are not supported.'))
            resolve()
        }
    })
}

const serviceWorkerPath = document.location.pathname + '/statics/service-worker.js'
export function enableIncomingCallNotifications () {
    return new Promise((resolve) => {
        Promise.resolve().then(() => {
            if (navigator.serviceWorker) {
                return navigator.serviceWorker.register(serviceWorkerPath)
            }
            showPermanentGlobalWarning(i18n.global.t('Incoming call notifications are not supported.'))
            resolve()
        }).then(() => {
            return askForNotificationPermission()
        }).then(() => {
            resolve()
        }).catch((err) => {
            console.debug(err)
            showPermanentGlobalWarning(i18n.global.t('Could not enable incoming call notifications.'))
        })
    })
}

export function showCallNotification (number) {
    if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistration(serviceWorkerPath).then((registration) => {
            if (registration && registration.showNotification) {
                registration.showNotification(i18n.global.t('Incoming call from {number}', {
                    number
                }), {
                    requireInteraction: true,
                    vibrate: [300, 200, 300, 200, 300],
                    tag: 'call-notification',
                    data: {
                        url: document.location.href
                    }
                })
            }
        })
    }
}
