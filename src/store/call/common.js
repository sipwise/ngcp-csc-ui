import {
    i18n
} from 'boot/i18n'

export const CallState = {
    input: 'input',
    initiating: 'initiating',
    ringing: 'ringing',
    incoming: 'incoming',
    established: 'established',
    ended: 'ended'
}
export const CallStateTitle = {
    get input () { return i18n.t('Start new call') },
    get initiating () { return i18n.t('Calling') },
    get ringing () { return i18n.t('Ringing at') },
    get incoming () { return i18n.t('Incoming call from') },
    get established () { return i18n.t('In call with') },
    get ended () { return i18n.t('Call ended') }
}

export const MediaType = {
    audioOnly: 'audioOnly',
    audioVideo: 'audioVideo',
    audioScreen: 'audioScreen'
}

export const errorVisibilityTimeout = 5000
export const reinitializeTimeout = 5000
