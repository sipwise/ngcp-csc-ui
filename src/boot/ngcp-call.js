
import {
    v4
} from 'uuid'
import _ from 'lodash'
import {
    callConfigure,
    callEnd,
    callEvent,
    callHasLocalCamera,
    callHasLocalScreen,
    callHasRemoteVideo,
    callIsMuted,
    callIsRemoteAudioMuted
} from 'src/api/ngcp-call'
import { errorVisibilityTimeout } from 'src/store/call/common'

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
        if (event.originator !== 'local') {
            callEnd()
            store.commit('call/endCall', cause)
            setTimeout(() => {
                store.commit('call/inputNumber')
            }, errorVisibilityTimeout)
        }
    }
    callEvent.on('connected', () => {
        store.commit('call/enableCall')
    })
    callEvent.on('disconnected', () => {
        store.commit('call/disableCall')
    })
    callEvent.on('outgoingProgress', (event) => {
        store.commit('call/startRinging')
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
    callEvent.on('localStream', () => {
        store.commit('call/toggleMicrophone', !callIsMuted())
    })
    callEvent.on('remoteStream', () => {
        store.commit('call/establishCall', {
            mediaStreamId: v4(),
            isLocalAudioMuted: callIsMuted(),
            hasLocalCamera: callHasLocalCamera(),
            hasLocalScreen: callHasLocalScreen(),
            hasRemoteVideo: callHasRemoteVideo(),
            isRemoteAudioMuted: callIsRemoteAudioMuted()
        })
    })
}
