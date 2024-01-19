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
    callToggleHold,
    callIsMuted,
    callSendDTMF,
    callToggleRemoteAudio,
    callIsRemoteMuted,
    callHasLocalScreen,
    callHasLocalCamera
} from 'src/api/ngcp-call'
import { errorVisibilityTimeout } from 'src/store/call/common'
import {
    showGlobalError
} from 'src/helpers/ui'
import {
    i18n
} from 'boot/i18n'

let errorVisibilityTimer = null

export default {
    async start (context, localMedia) {
        const number = context.getters.callNumberInput.replaceAll('(', '')
            .replaceAll(')', '')
            .replaceAll(' ', '')
            .replaceAll('-', '')
        context.commit('startCalling', number)
        const isStarted = await callStart({
            number,
            localMedia
        })
        if (isStarted) {
            context.commit('localMediaSuccess', callGetLocalMediaStreamId())
        } else {
            context.commit('inputNumber')
            showGlobalError(i18n.global.tc('No microphone authorized.'))
        }
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
    async toggleHoldon (context) {
        callToggleHold()
        context.commit('toggleHold')
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
                errorVisibilityTimer = null
            }
            context.commit('endCall')
            context.commit('hangUpCall')
        } else if (options.cause && !errorVisibilityTimer) {
            context.commit('endCall', options.cause)
            if (options.cause !== 'Busy') {
                errorVisibilityTimer = setTimeout(() => {
                    if (context.state.callState === 'ended') {
                        context.commit('hangUpCall')
                    }
                    errorVisibilityTimer = null
                }, errorVisibilityTimeout)
            }
        }
    },
    sendDTMF (context, tone) {
        callSendDTMF(tone)
    }
}
