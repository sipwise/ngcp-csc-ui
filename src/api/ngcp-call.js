
import {
    EventEmitter
} from 'events'
import jssip from 'jssip'

let $baseWebSocketUrl = null
let $subscriber = null
let $socket = null
let $userAgent = null
let $isVideoScreen = false
let $outgoingRtcSession = null
let $incomingRtcSession = null
let $localMediaStream = null
let $remoteMediaStream = null
let $videoTransceiver = null
let $audioTransceiver = null

const TERMINATION_OPTIONS = {
    status_code: 603,
    reason_phrase: 'Decline'
}

const VIDEO_MAX_FRAME_RATE = 30
const VIDEO_IDEAL_WIDTH = 1920
const VIDEO_IDEAL_HEIGHT = 1080

function callGetVideoConstraints () {
    const supported = navigator?.mediaDevices?.getSupportedConstraints()
    const constraints = {}
    if (supported.frameRate) {
        constraints.frameRate = {
            max: VIDEO_MAX_FRAME_RATE
        }
    }
    constraints.width = {
        ideal: VIDEO_IDEAL_WIDTH
    }
    constraints.height = {
        ideal: VIDEO_IDEAL_HEIGHT
    }
    return constraints
}

function callGetCameraConstraints () {
    const supported = navigator?.mediaDevices?.getSupportedConstraints()
    const constraints = callGetVideoConstraints()
    if (supported.facingMode) {
        constraints.facingMode = 'user'
    }
    return constraints
}

function callGetScreenConstraints () {
    return callGetVideoConstraints()
}

export const callEvent = new EventEmitter()

function callTrackMuteHandler () {
    if ($audioTransceiver) {
        $remoteMediaStream = new MediaStream([
            $audioTransceiver.receiver.track
        ])
        callEvent.emit('remoteStream', $remoteMediaStream)
    }
}

function callTrackUnMuteHandler () {
    if ($audioTransceiver && $videoTransceiver) {
        $remoteMediaStream = new MediaStream([
            $audioTransceiver.receiver.track,
            $videoTransceiver.receiver.track
        ])
        callEvent.emit('remoteStream', $remoteMediaStream)
    }
}

function handleRemoteMediaStream ({ transceiver }) {
    if (!$audioTransceiver && transceiver.receiver.track.kind === 'audio') {
        $audioTransceiver = transceiver
    } else if (!$videoTransceiver && transceiver.receiver.track.kind === 'video') {
        $videoTransceiver = transceiver
        $videoTransceiver.receiver.track.onmute = callTrackMuteHandler
        $videoTransceiver.receiver.track.onunmute = callTrackUnMuteHandler
    }
    const tracks = []
    if ($audioTransceiver) {
        tracks.push($audioTransceiver.receiver.track)
    }
    if ($videoTransceiver) {
        tracks.push($videoTransceiver.receiver.track)
    }
    $remoteMediaStream = new MediaStream(tracks)
    callEvent.emit('remoteStream', $remoteMediaStream)
}

function getSubscriberUri () {
    return 'sip:' + $subscriber.username + '@' + $subscriber.domain
}

function callCreateSocket () {
    return new jssip.WebSocketInterface($baseWebSocketUrl + '/' + $subscriber.username)
}

export function callConfigure ({ baseWebSocketUrl }) {
    $baseWebSocketUrl = baseWebSocketUrl
}

export async function callInitialize ({ subscriber, instanceId }) {
    $subscriber = subscriber
    callRegister({ instanceId })
}

export function callRegister ({ instanceId }) {
    if (!$socket) {
        $socket = callCreateSocket()
        const config = {
            sockets: [$socket],
            uri: getSubscriberUri(),
            password: $subscriber.password,
            instance_id: instanceId
        }
        $userAgent = new jssip.UA(config)
        const delegateEvent = (eventName) => {
            $userAgent.on(eventName, (event) => callEvent.emit(eventName, event))
        }
        delegateEvent('connected')
        delegateEvent('disconnected')
        delegateEvent('newRTCSession')
        delegateEvent('newMessage')
        delegateEvent('registered')
        delegateEvent('unregistered')
        delegateEvent('registrationFailed')
        $userAgent.on('newRTCSession', (event) => {
            if (event.originator === 'remote') {
                $incomingRtcSession = event.session
                $incomingRtcSession.on('peerconnection', () => {
                    $incomingRtcSession.connection.ontrack = handleRemoteMediaStream
                })
                $incomingRtcSession.on('failed', (failedEvent) => {
                    callEvent.emit('incomingFailed', failedEvent)
                })
                $incomingRtcSession.on('ended', (failedEvent) => {
                    callEvent.emit('incomingEnded', failedEvent)
                    $incomingRtcSession = null
                })
                callEvent.emit('incoming', $incomingRtcSession)
            }
        })
        $userAgent.start()
    }
}

export function callUnregister () {
    if ($userAgent) {
        $userAgent.unregister({
            all: true
        })
    }
}

export async function callStart ({ number }) {
    $localMediaStream = await callCreateLocalAudioStream()
    callEvent.emit('localStream', $localMediaStream)
    $outgoingRtcSession = $userAgent.call(number, {
        eventHandlers: {
            progress (event) {
                if (event.response.status_code === 183) {
                    callEvent.emit('outgoingProgress', event)
                } else {
                    callEvent.emit('outgoingRinging', event)
                }
            },
            failed (event) {
                callEvent.emit('outgoingFailed', event)
            },
            confirmed (event) {
                callEvent.emit('outgoingConfirmed', event)
            },
            ended (event) {
                callEvent.emit('outgoingEnded', event)
                $outgoingRtcSession = null
            }
        },
        mediaStream: $localMediaStream
    })
    $outgoingRtcSession.connection.ontrack = handleRemoteMediaStream
}

export async function callAccept () {
    $localMediaStream = await callCreateLocalAudioStream()
    callEvent.emit('localStream', $localMediaStream)
    if ($incomingRtcSession) {
        $incomingRtcSession.answer({
            mediaStream: $localMediaStream
        })
    }
}

export async function callCreateLocalAudioStream () {
    return await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
    })
}

export function callGetRemoteMediaStream () {
    return $remoteMediaStream
}

export function callGetRemoteMediaStreamId () {
    return $remoteMediaStream?.id
}

export function callGetLocalMediaStream () {
    return $localMediaStream
}

export function callGetLocalMediaStreamId () {
    return $localMediaStream?.id
}

export function callGetRtcSession () {
    if ($outgoingRtcSession) {
        return $outgoingRtcSession
    } else if ($incomingRtcSession) {
        return $incomingRtcSession
    }
}

export function callGetRtcConnection () {
    return callGetRtcSession().connection
}

async function callStopVideo () {
    if ($videoTransceiver && $localMediaStream) {
        $localMediaStream.removeTrack($videoTransceiver.sender.track)
        $videoTransceiver.sender.track.stop()
        $videoTransceiver.direction = 'recvonly'
        await $videoTransceiver.sender.replaceTrack(null)
        await callRenegotiate()
    }
}

export async function callSendVideo (stream, audioMuted) {
    const videoTrack = stream.getVideoTracks()[0]
    if ($videoTransceiver?.sender?.track) {
        $localMediaStream.removeTrack($videoTransceiver.sender.track)
        $videoTransceiver.sender.track.stop()
    }
    $localMediaStream.addTrack(videoTrack)
    callEvent.emit('localStream', $localMediaStream)
    if (!$videoTransceiver) {
        $videoTransceiver = callGetRtcConnection().addTransceiver(videoTrack, { direction: 'sendrecv' })
        $videoTransceiver.receiver.track.onmute = callTrackMuteHandler
        $videoTransceiver.receiver.track.onunmute = callTrackUnMuteHandler
    } else {
        $videoTransceiver.direction = 'sendrecv'
        await $videoTransceiver.sender.replaceTrack(videoTrack)
    }
    await callRenegotiate()
}

export async function callAddCamera () {
    $isVideoScreen = false
    await callSendVideo(await navigator.mediaDevices.getUserMedia({
        video: callGetCameraConstraints(),
        audio: false
    }))
}

export async function callAddScreen () {
    $isVideoScreen = true
    await callSendVideo(await navigator.mediaDevices.getDisplayMedia({
        video: callGetScreenConstraints(),
        audio: false
    }))
}

export async function callRemoveVideo () {
    $isVideoScreen = false
    await callStopVideo()
}

export async function callRenegotiate () {
    callGetRtcSession().renegotiate({
        useUpdate: false
    }, () => {
        callEvent.emit('renegotiationSucceeded')
    })
}

export function callHasRemoteVideo () {
    return $videoTransceiver?.receiver?.track?.enabled
}

export function callHasLocalVideo () {
    return $videoTransceiver?.sender?.track?.enabled
}

export function callHasLocalCamera () {
    return callHasLocalVideo() && !$isVideoScreen
}

export function callHasLocalScreen () {
    return callHasLocalVideo() && $isVideoScreen
}

export function callToggleMicrophone () {
    if ($audioTransceiver?.sender?.track) {
        $audioTransceiver.sender.track.enabled = !$audioTransceiver.sender.track.enabled
    }
}

export function callMute () {
    return callGetRtcSession()?.mute()
}

export function callUnMute () {
    return callGetRtcSession()?.unmute()
}

export function callIsMuted () {
    if ($audioTransceiver?.sender?.track) {
        return !$audioTransceiver.sender.track.enabled
    }
    return false
}

export function callSendDTMF (tone, transport = 'RFC2833') {
    const rtcSession = callGetRtcSession()
    if (rtcSession) {
        rtcSession.sendDTMF(tone, {
            transportType: transport
        })
    }
}

/**
 * Enables or disables the remote audio depending on the current state.
 */
export function callToggleRemoteAudio () {
    if ($audioTransceiver?.receiver?.track) {
        $audioTransceiver.receiver.track.enabled = !$audioTransceiver.receiver.track.enabled
    }
}

export function callMuteRemote () {
    if ($audioTransceiver?.receiver?.track) {
        $audioTransceiver.receiver.track.enabled = false
    }
}

export function callUnMuteRemote () {
    if ($audioTransceiver?.receiver?.track) {
        $audioTransceiver.receiver.track.enabled = true
    }
}

/**
 * Checks whether remote audio is muted or not.
 * @returns {boolean}
 */
export function callIsRemoteMuted () {
    return !$audioTransceiver?.receiver?.track?.enabled
}

/**
 * Terminates the call if not ended and cleans up all related resources.
 */
export function callEnd () {
    const rtcSession = callGetRtcSession()
    if (rtcSession && !rtcSession.isEnded()) {
        rtcSession.terminate(TERMINATION_OPTIONS)
    }
    try {
        if ($localMediaStream) {
            $localMediaStream.getTracks().forEach(track => track.stop())
        }
    } finally {
        $localMediaStream = null
    }
    try {
        if ($remoteMediaStream) {
            $remoteMediaStream.getTracks().forEach(track => track.stop())
        }
    } finally {
        $remoteMediaStream = null
    }
    $outgoingRtcSession = null
    $incomingRtcSession = null
    $audioTransceiver = null
    $videoTransceiver = null
}
