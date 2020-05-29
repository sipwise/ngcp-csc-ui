
import _ from 'lodash'
import { Loading, Alert, Toast } from 'quasar-framework'
import { i18n } from '../i18n';

export function startLoading() {
    Loading.show({ delay: 0 });
}

export function stopLoading() {
    Loading.hide();
}

export function showGlobalError(message) {
    const alert = Alert.create({
        html: message,
        position: 'top-center',
        enter: 'bounceIn',
        leave: 'fadeOut',
        color: 'negative'
    });
    setTimeout(()=>{ alert.dismiss(); }, 2000);
}

export function showGlobalWarning(message, timeout) {
    const alert = Alert.create({
        html: message,
        position: 'top-center',
        enter: 'bounceIn',
        leave: 'fadeOut',
        color: 'warning'
    });
    setTimeout(()=>{ alert.dismiss(); }, timeout || 2000);
}

export function showPermanentGlobalWarning(message) {
    Alert.create({
        html: message,
        position: 'top-center',
        enter: 'bounceIn',
        leave: 'fadeOut',
        color: 'warning'
    });
}


export function showToast(message) {
    Toast.create({
        html: message,
        color: '#151d30',
        bgColor: '#40cc3d'
    });
}

export function askForNotificationPermission() {
    return new Promise((resolve, reject)=>{
        if(_.isObject(Notification)) {
            Notification.requestPermission().then((perms)=>{
                if(perms === 'denied' || perms === 'default') {
                    showPermanentGlobalWarning(i18n.t('call.notificationBlocked'));
                }
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        }
        else {
            showPermanentGlobalWarning(i18n.t('call.notificationNotSupported'));
            resolve();
        }
    });
}

var serviceWorkerPath = document.location.pathname + '/statics/service-worker.js';
export function enableIncomingCallNotifications() {
    return new Promise((resolve)=>{
        Promise.resolve().then(()=>{
            if(navigator.serviceWorker) {
                return navigator.serviceWorker.register(serviceWorkerPath);
            }
            else {
                showPermanentGlobalWarning(i18n.t('call.notificationNotSupported'));
                resolve();
            }
        }).then(()=>{
            return askForNotificationPermission();
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            console.debug(err);
            showPermanentGlobalWarning(i18n.t('call.notificationFailed'));
        });
    });
}

export function showCallNotification(number) {
    if(navigator.serviceWorker) {
        navigator.serviceWorker.getRegistration(serviceWorkerPath).then((registration)=>{
            if(registration && registration.showNotification) {
                registration.showNotification(i18n.t('call.notificationTitle', {
                    number: number
                }), {
                    requireInteraction: true,
                    vibrate: [300, 200, 300, 200, 300],
                    tag: 'call-notification',
                    data: {
                        url: document.location.href
                    }
                });
            }
        });
    }
}
