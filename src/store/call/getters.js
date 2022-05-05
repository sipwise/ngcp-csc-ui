import {
    callGetLocalMediaStream,
    callGetRemoteMediaStream,
    callHasRemoteVideo
} from 'src/api/ngcp-call'
import {
    normalizeDestination
} from 'src/filters/number-format'
import {
    startCase
} from 'src/filters/string'
import {
    CallState,
    CallStateTitle
} from 'src/store/call/common'

export default {
    isCallEnabled (state) {
        return state.callEnabled
    },
    endedReason (state) {
        return state.endedReason
    },
    callNumber (state) {
        return state.number
    },
    callNumberInput (state) {
        return state.numberInput
    },
    isPreparing (state) {
        return state.callState === CallState.input
    },
    isInitiating (state) {
        return state.callState === CallState.initiating
    },
    isIncoming (state) {
        return state.callState === CallState.incoming
    },
    isTrying (state) {
        return state.callState === CallState.initiating ||
            state.callState === CallState.ringing
    },
    isRinging (state) {
        return state.callState === CallState.ringing
    },
    isCalling (state) {
        return state.callState === CallState.initiating ||
            state.callState === CallState.ringing ||
            state.callState === CallState.established ||
            state.callState === CallState.incoming ||
            state.callState === CallState.ended
    },
    isEstablished (state) {
        return state.callState === CallState.established
    },
    isEnded (state) {
        return state.callState === CallState.ended
    },
    hasRemoteVideo (state) {
        if (state.remoteMediaStream !== null) {
            return callHasRemoteVideo()
        }
    },
    hasLocalVideo (state, getters) {
        if (state.localMediaStream !== null) {
            return getters.isScreenEnabled || getters.isCameraEnabled
        }
    },
    hasVideo (state, getters) {
        return getters.hasLocalVideo || getters.hasRemoteVideo
    },
    isCaller (state) {
        return state.caller
    },
    isCallee (state) {
        return state.callee
    },
    callState (state) {
        return state.callState
    },
    localMediaStream (state) {
        if (state.localMediaStream) {
            return callGetLocalMediaStream()
        }
        return null
    },
    remoteMediaStream (state) {
        if (state.remoteMediaStream) {
            return callGetRemoteMediaStream()
        }
        return null
    },
    isMicrophoneEnabled (state) {
        return state.microphoneEnabled
    },
    isCameraEnabled (state) {
        return state.cameraEnabled
    },
    isScreenEnabled (state) {
        return state.screenEnabled
    },
    isRemoteVolumeEnabled (state) {
        return state.remoteAudioEnabled
    },
    isMaximized (state) {
        return state.maximized
    },
    isDialpadOpened (state) {
        return state.dialpadOpened
    },
    callNumberFormatted (state, getters) {
        return normalizeDestination(getters.callNumber)
    },
    callEndedReasonFormatted (state, getters) {
        return startCase(getters.endedReason)
    },
    callStateTitle (state) {
        return CallStateTitle[state.callState]
    },
    callStateSubtitle (state, getters) {
        if (state.callState === CallState.initiating ||
            state.callState === CallState.ringing ||
            state.callState === CallState.incoming ||
            state.callState === CallState.established) {
            return getters.callNumberFormatted
        } else if (state.callState === CallState.ended) {
            return getters.callEndedReasonFormatted
        } else {
            return ''
        }
    },
    connectionError (state) {
        return state.connectionError
    }
}
