import {
    CallState
} from 'src/store/call/common'

export default {
    numberInputChanged (state, numberInput) {
        state.numberInput = numberInput
    },
    inputNumber (state) {
        state.callState = CallState.input
        state.number = ''
        state.numberInput = ''
        state.endedReason = null
    },
    startCalling (state, number) {
        state.number = number
        state.callState = CallState.initiating
        state.caller = true
        state.callee = false
        state.endedReason = null
    },
    localMediaSuccess (state, localMediaStreamId) {
        state.localMediaStream = localMediaStreamId
    },
    startRinging (state) {
        state.callState = CallState.ringing
    },
    stopRinging (state) {
        state.callState = CallState.established
    },
    establishCall (state, {
        mediaStreamId,
        hasLocalCamera = false,
        hasLocalScreen = false,
        hasRemoteVideo = false
    }) {
        state.callState = CallState.established
        state.remoteMediaStream = mediaStreamId
        state.cameraEnabled = hasLocalCamera
        state.screenEnabled = hasLocalScreen
        state.remoteVideoEnabled = hasRemoteVideo
    },
    incomingCall (state, options) {
        state.callState = CallState.incoming
        state.number = options.number
        state.callee = true
        state.caller = false
        state.endedReason = null
    },
    hangUpCall (state) {
        if (state.callState !== CallState.input) {
            state.callState = CallState.input
            state.number = ''
            state.numberInput = ''
            state.endedReason = null
        }
    },
    endCall (state, reason) {
        if (reason) {
            state.callState = CallState.ended
            state.endedReason = reason
        }
        state.dialpadOpened = false
        state.microphoneEnabled = true
        state.cameraEnabled = false
        state.screenEnabled = false
        state.remoteAudioEnabled = true
        state.remoteVideoEnabled = false
        state.localMediaStream = null
        state.remoteMediaStream = null
    },
    toggleMicrophone (state, enabled) {
        state.microphoneEnabled = enabled
    },
    enableCamera (state) {
        state.cameraEnabled = true
    },
    enableScreen (state) {
        state.screenEnabled = true
    },
    disableVideo (state) {
        state.cameraEnabled = false
        state.screenEnabled = false
    },
    toggleRemoteAudio (state, enabled) {
        state.remoteAudioEnabled = enabled
    },
    maximize (state) {
        state.dialpadOpened = false
        state.maximized = true
    },
    minimize (state) {
        state.dialpadOpened = false
        state.maximized = false
    },
    toggleDialpad (state) {
        state.dialpadOpened = !state.dialpadOpened
    },
    enableCall (state) {
        state.callEnabled = true
        state.connectionError = null
    },
    disableCall (state, options = { error: null }) {
        state.callEnabled = false
        state.connectionError = options.error
    },
    toggleHold (state) {
        state.holdEnabled = !state.holdEnabled
        if (state.holdEnabled) {
            state.holdEnabled = true
        }
    }
}
