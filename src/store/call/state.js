
import {
    CallState
} from 'src/store/call/common'

export default {
    callEnabled: false,
    endedReason: null,
    callState: CallState.input,
    number: '',
    numberInput: '',
    localMediaStream: null,
    remoteMediaStream: null,
    caller: false,
    callee: false,
    microphoneEnabled: true,
    cameraEnabled: false,
    screenEnabled: false,
    remoteAudioEnabled: true,
    remoteVideoEnabled: true,
    maximized: false,
    dialpadOpened: false
}
