
import { Loading, Alert } from 'quasar'

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
        leave: 'fadeOut'
    });
    setTimeout(()=>{ alert.dismiss(); }, 2000);
}

