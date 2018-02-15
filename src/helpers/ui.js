
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

export function showGlobalWarning(message) {
    const alert = Alert.create({
        html: message,
        position: 'top-center',
        enter: 'bounceIn',
        leave: 'fadeOut',
        color: 'warning'
    });
    setTimeout(()=>{ alert.dismiss(); }, 2000);
}

export function showPermanentGlobalWarning(message) {
    const alert = Alert.create({
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
        color: 'white',
        bgColor: '#68A44E'
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
        } else {
            showPermanentGlobalWarning(i18n.t('call.notificationNotSupported'));
            resolve();
        }
    });
}

var serviceWorkerPath = '/csc/statics/service-worker.js';
export function enableIncomingCallNotifications() {
    return new Promise((resolve, reject)=>{
        Promise.resolve().then(()=>{
            if(navigator.serviceWorker) {
                return navigator.serviceWorker.register(serviceWorkerPath);
            } else {
                showPermanentGlobalWarning(i18n.t('call.notificationNotSupported'));
                resolve();
            }
        }).then(()=>{
            return askForNotificationPermission();
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            showPermanentGlobalWarning(i18n.t('call.notificationFailed'));
            console.error(err);
        });
    });
}
