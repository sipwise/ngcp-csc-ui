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
        isLocalAudioMuted = false,
        hasLocalCamera = false,
        hasLocalScreen = false,
        hasRemoteVideo = false,
        isRemoteAudioMuted = false
    }) {
        state.remoteMediaStream = mediaStreamId
        state.callState = CallState.established
        state.microphoneEnabled = !isLocalAudioMuted
        state.cameraEnabled = hasLocalCamera
        state.screenEnabled = hasLocalScreen
        state.remoteAudioEnabled = !isRemoteAudioMuted
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
        state.callState = CallState.input
        state.number = ''
        state.numberInput = ''
        state.endedReason = null
    },
    endCall (state, reason) {
        if (state.endedReason === null) {
            state.callState = CallState.ended
            state.endedReason = reason
            state.localMediaStream = null
            state.remoteMediaStream = null
        }
    },
    sendDTMF (state, value) {
        state.dtmf = value
    },
    toggleMicrophone (state, enabled) {
        state.microphoneEnabled = enabled
    },
    setCamera (state, enabled) {
        state.cameraEnabled = enabled
    },
    enableCamera (state) {
        state.cameraEnabled = true
    },
    enableScreen (state) {
        state.screenEnabled = true
    },
    setScreen (state, enabled) {
        state.screenEnabled = enabled
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
    },
    disableCall (state) {
        state.callEnabled = false
    }
}
