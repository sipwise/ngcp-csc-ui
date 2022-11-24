import {
    callGetLocalMediaStreamId,
    callAccept,
    callEnd,
    callStart,
    callAddCamera,
    callAddScreen,
    callRemoveVideo,
    callHasLocalVideo,
    callToggleMicrophone,
    callIsMuted,
    callSendDTMF,
    callToggleRemoteAudio,
    callIsRemoteMuted,
    callHasLocalScreen,
    callHasLocalCamera
} from 'src/api/ngcp-call'
import { errorVisibilityTimeout } from 'src/store/call/common'

let errorVisibilityTimer = null

export default {
    async start (context, localMedia) {
        const number = context.getters.callNumberInput.replaceAll('(', '')
            .replaceAll(')', '')
            .replaceAll(' ', '')
            .replaceAll('-', '')
        context.commit('startCalling', number)
        await callStart({
            number,
            localMedia
        })
        context.commit('localMediaSuccess', callGetLocalMediaStreamId())
    },
    async accept (context, localMedia) {
        await callAccept({
            localMedia
        })
        context.commit('localMediaSuccess', callGetLocalMediaStreamId())
    },
    async toggleMicrophone (context) {
        callToggleMicrophone()
        context.commit('toggleMicrophone', !callIsMuted())
    },
    toggleRemoteAudio (context) {
        callToggleRemoteAudio()
        context.commit('toggleRemoteAudio', !callIsRemoteMuted())
    },
    async toggleCamera (context) {
        if (!callHasLocalVideo() || callHasLocalScreen()) {
            await callAddCamera()
            context.commit('disableVideo')
            context.commit('enableCamera')
        } else {
            await callRemoveVideo()
            context.commit('disableVideo')
        }
    },
    async toggleScreen (context) {
        if (!callHasLocalVideo() || callHasLocalCamera()) {
            await callAddScreen()
            context.commit('disableVideo')
            context.commit('enableScreen')
        } else {
            await callRemoveVideo()
            context.commit('disableVideo')
        }
    },
    end (context, options = { cause: null }) {
        callEnd()
        if (!options.cause) {
            if (errorVisibilityTimer) {
                clearTimeout(errorVisibilityTimer)
            }
            context.commit('endCall')
            context.commit('hangUpCall')
        } else if (options.cause && !errorVisibilityTimer) {
            context.commit('endCall', options.cause)
            errorVisibilityTimer = setTimeout(() => {
                if (context.state.callState === 'ended') {
                    context.commit('hangUpCall')
                }
                errorVisibilityTimer = null
            }, errorVisibilityTimeout)
        }
    },
    sendDTMF (context, tone) {
        callSendDTMF(tone)
    }
}
