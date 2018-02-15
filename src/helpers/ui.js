
import { Loading, Alert, Toast } from 'quasar-framework'

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

export function removeDialog(options) {

}
