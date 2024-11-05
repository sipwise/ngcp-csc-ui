import { i18n } from 'boot/i18n'

export const CallState = {
    input: 'input',
    initiating: 'initiating',
    ringing: 'ringing',
    incoming: 'incoming',
    established: 'established',
    ended: 'ended',
    hold: 'hold',
    unhold: 'unhold'
}
export const CallStateTitle = {
    get input () {
        return i18n.global.tc('Start new call')
    },
    get initiating () {
        return i18n.global.tc('Calling')
    },
    get ringing () {
        return i18n.global.tc('Ringing at')
    },
    get incoming () {
        return i18n.global.tc('Incoming call from')
    },
    get established () {
        return i18n.global.tc('In call with')
    },
    get ended () {
        return i18n.global.tc('Call ended')
    },
    get hold () {
        return i18n.global.tc('Call holded')
    }
}

export const MediaType = {
    audioOnly: 'audioOnly',
    audioVideo: 'audioVideo',
    audioScreen: 'audioScreen'
}

export const errorVisibilityTimeout = 5000
export const reinitializeTimeout = 5000
