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
    callIsRemoteAudioMuted, callHasLocalScreen, callHasLocalCamera
} from 'src/api/ngcp-call'

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
    async toggleCamera (context) {
        if (!callHasLocalVideo() || callHasLocalScreen()) {
            await callAddCamera()
            context.commit('disableVideo')
            context.commit('enableCamera')
        } else {
            await callRemoveVideo()
            context.commit('disableVideo')
        }
        context.commit('localMediaSuccess', callGetLocalMediaStreamId())
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
        context.commit('localMediaSuccess', callGetLocalMediaStreamId())
    },
    end (context) {
        callEnd()
        context.commit('hangUpCall')
    },
    sendDTMF (context, tone) {
        callSendDTMF(tone)
    },
    toggleRemoteAudio (context) {
        callToggleRemoteAudio()
        context.commit('toggleRemoteAudio', !callIsRemoteAudioMuted())
    }
}
