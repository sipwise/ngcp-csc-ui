// src/helpers/platform.js
import { Platform } from 'quasar'

export function isMobile () {
    return Platform.is.mobile
}

export function isDesktop () {
    return Platform.is.desktop
}

export function getPlatform () {
    return {
        isMobile: Platform.is.mobile,
        isDesktop: Platform.is.desktop,
        isAndroid: Platform.is.android,
        isIOS: Platform.is.ios,
        isCordova: Platform.is.cordova
    }
}
