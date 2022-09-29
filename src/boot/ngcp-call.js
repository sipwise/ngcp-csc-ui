
import _ from 'lodash'
import {
    callConfigure,
    callEvent,
    callHasLocalCamera,
    callHasLocalScreen,
    callHasRemoteVideo,
    callMute,
    callMuteRemote,
    callUnMute,
    callUnMuteRemote
} from 'src/api/ngcp-call'

export default async ({ Vue, app, store }) => {
    callConfigure({
        baseWebSocketUrl: app.$appConfig.baseWsUrl + '/wss/sip'
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
            errorMessage = app.i18n.t('WebSocket connection to kamailio lb failed with code {code}', {
                code: code
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
        store.commit('call/incomingCall', {
            number: _.get(session, 'remote_identity.uri.user', 'Unknown')
        })
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
}
