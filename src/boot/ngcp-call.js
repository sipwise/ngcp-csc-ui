import { i18n } from 'boot/i18n'
import _ from 'lodash'
import {
    callConfigure,
    callEvent,
    callHasLocalCamera,
    callHasLocalScreen,
    callHasRemoteVideo,
    callMute,
    callMuteRemote,
    callStart,
    callUnMute,
    callUnMuteRemote
} from 'src/api/ngcp-call'
import { store } from 'src/boot/store'

export default async ({ app }) => {
    callConfigure({
        baseWebSocketUrl: `${app.config.globalProperties.$appConfig.baseWsUrl}/wss/sip`
    })
    const callFailed = (event) => {
        let cause = event.cause
        const reason = event.message?.parseHeader?.('Reason')
        if (reason?.text) {
            cause = reason.text
        }
        store.dispatch('call/end', { cause })
    }
    callEvent.on('connected', () => {
        store.commit('call/enableCall')
    })
    callEvent.on('disconnected', ({ error, code }) => {
        let errorMessage = null
        if (error) {
            errorMessage = i18n.global.t('WebSocket connection to kamailio lb failed with code {code}', {
                code
            })
        }
        store.commit('call/disableCall', {
            error: errorMessage
        })
    })
    callEvent.on('outgoingRinging', (event) => {
        store.commit('call/startRinging')
    })
    callEvent.on('outgoingProgress', (event) => {
        store.commit('call/stopRinging')
    })
    callEvent.on('outgoingConfirmed', (event) => {
        store.commit('call/stopRinging')
    })
    callEvent.on('outgoingFailed', callFailed)
    callEvent.on('incomingFailed', callFailed)
    callEvent.on('outgoingEnded', callFailed)
    callEvent.on('incomingEnded', callFailed)
    callEvent.on('incoming', (session) => {
        const number = _.get(session, 'remote_identity.uri.user', 'Unknown')
        store.dispatch('call/processIncomingCall', number)
    })
    callEvent.on('localStream', (stream) => {
        if (store.state.call.microphoneEnabled) {
            callUnMute()
        } else {
            callMute()
        }
        store.commit('call/localMediaSuccess', stream.id)
    })
    callEvent.on('remoteStream', (stream) => {
        if (store.state.call.remoteAudioEnabled) {
            callUnMuteRemote()
        } else {
            callMuteRemote()
        }
        store.commit('call/establishCall', {
            mediaStreamId: stream.id,
            hasLocalCamera: callHasLocalCamera(),
            hasLocalScreen: callHasLocalScreen(),
            hasRemoteVideo: callHasRemoteVideo()
        })
    })
    callEvent.on('incomingHold', (event) => {
        if (event.originator === 'remote') {
            store.commit('call/toggleHold')
            store.commit('call/setRemoteOnHold', true)
        } else if (event.originator === 'local') {
            callEvent.on('outgoingHold', (event) => {
                store.commit('call/toggleHold')
                store.commit('call/setLocalOnHold', true)
                store.commit('call/setRemoteOnHold', false)
            })
        }
    })
    callEvent.on('incomingUnHold', (event) => {
        if (event.originator === 'remote') {
            store.commit('call/toggleHold')
            store.commit('call/setRemoteOnHold', false)
        } else if (event.originator === 'local') {
            callEvent.on('outgoingUnHold', (event) => {
                store.commit('call/toggleHold')
                store.commit('call/setLocalOnHold', false)
            })
        }
    })
    callEvent.on('outgoingHolded', (event) => {
        store.commit('call/toggleHold')
        store.commit('call/setLocalOnHold', true)
    })
    callEvent.on('outgoingUnHolded', (event) => {
        store.commit('call/toggleHold')
        store.commit('call/setLocalOnHold', false)
    })
    callEvent.on('outgoingRefer', (event) => {
        const number = event.request.refer_to._uri._user
        store.commit('call/startCalling', number)
        callStart({
            number
        })
    })
    callEvent.on('incomingRefer', (event) => {
        const number = event.request.refer_to._uri._user
        store.commit('call/startCalling', number)
        callStart({
            number
        })
    })
}
