
import {
    EventEmitter
} from 'events'
import jssip from 'jssip'

let $baseWebSocketUrl = null
let $subscriber = null
let $socket = null
let $userAgent = null
let $outgoingRtcSession = null
let $incomingRtcSession = null
let $localMediaStream = null
let $remoteMediaStream = null
let $isVideoScreen = false

const TERMINATION_OPTIONS = {
    status_code: 603,
    reason_phrase: 'Decline'
}

export const callEvent = new EventEmitter()

function handleRemoteMediaStream (trackEvent) {
    const stream = trackEvent.streams[0]
    if (!$remoteMediaStream) {
        $remoteMediaStream = stream
        callEvent.emit('remoteStream', $remoteMediaStream)
    } else if ($remoteMediaStream && $remoteMediaStream.id !== stream.id) {
        $remoteMediaStream = stream
        callEvent.emit('remoteStream', $remoteMediaStream)
    }
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

export async function callInitialize ({ subscriber }) {
    $subscriber = subscriber
    callRegister()
}

export function callRegister () {
    if (!$socket) {
        $socket = callCreateSocket()
        const config = {
            sockets: [$socket],
            uri: getSubscriberUri(),
            password: $subscriber.password
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
                callEvent.emit('outgoingProgress', event)
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
    const delegateEvent = (eventName, newName) => {
        $outgoingRtcSession.on(eventName, (event) => callEvent.emit(newName, event))
    }
    delegateEvent('failed', 'outgoingFailed')
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

export async function callChangeVideoStream (stream) {
    if ($localMediaStream && callGetRtcSession()) {
        callGetRtcSession().connection.getSenders().forEach(
            sender => callGetRtcSession().connection.removeTrack(sender)
        )
        $localMediaStream.getTracks().forEach(track => track.stop())
        $localMediaStream = stream
        $localMediaStream.getTracks().forEach(
            track => callGetRtcSession().connection.addTrack(track, $localMediaStream)
        )
        await callRenegotiate()
    }
}

export async function callAddCamera () {
    await callChangeVideoStream(await navigator.mediaDevices.getUserMedia({
        video: {
            width: {
                ideal: 4096
            },
            height: {
                ideal: 2160
            }
        },
        audio: true
    }))
    $isVideoScreen = false
}

export async function callAddScreen () {
    $isVideoScreen = true
    await callChangeVideoStream(await navigator.mediaDevices.getDisplayMedia({
        video: {
            width: {
                ideal: 4096
            },
            height: {
                ideal: 2160
            }
        },
        audio: true
    }))
}

export async function callRemoveVideo () {
    $isVideoScreen = false
    await callChangeVideoStream(await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
    }))
}

export async function callRenegotiate () {
    callGetRtcSession().renegotiate({
        useUpdate: false
    }, () => {
        callEvent.emit('renegotiationSucceeded')
    })
}

export function callHasRemoteVideo () {
    return $remoteMediaStream?.getVideoTracks?.()?.length > 0
}

export function callHasLocalVideo () {
    return $localMediaStream?.getVideoTracks?.()?.length > 0
}

export function callHasLocalCamera () {
    return callHasLocalVideo() && !$isVideoScreen
}

export function callHasLocalScreen () {
    return callHasLocalVideo() && $isVideoScreen
}

export function callToggleMicrophone () {
    const config = {
        audio: true,
        video: false
    }
    const rtcSession = callGetRtcSession()
    const muted = rtcSession?.isMuted()
    if (muted.audio) {
        rtcSession.unmute(config)
    } else {
        rtcSession.mute(config)
    }
}

export function callIsMuted () {
    return callGetRtcSession()?.isMuted()?.audio
}

export function callSendDTMF (tone, transport = 'RFC2833') {
    const rtcSession = callGetRtcSession()
    if (rtcSession) {
        rtcSession.sendDTMF(tone, {
            transportType: transport
        })
    }
}

export function callToggleRemoteAudio () {
    if ($remoteMediaStream && $remoteMediaStream.getAudioTracks()[0]) {
        $remoteMediaStream.getAudioTracks()[0].enabled = !$remoteMediaStream?.getAudioTracks()[0]?.enabled
    }
}

export function callIsRemoteAudioMuted () {
    return !$remoteMediaStream?.getAudioTracks()[0]?.enabled
}

export function callEnd () {
    if ($outgoingRtcSession && !$outgoingRtcSession.isEnded()) {
        $outgoingRtcSession.terminate(TERMINATION_OPTIONS)
        $outgoingRtcSession = null
    }
    if ($incomingRtcSession && !$incomingRtcSession.isEnded()) {
        $incomingRtcSession.terminate(TERMINATION_OPTIONS)
        $incomingRtcSession = null
    }
    if ($localMediaStream) {
        $localMediaStream.getTracks().forEach(track => track.stop())
        $localMediaStream = null
    }
    if ($remoteMediaStream) {
        $remoteMediaStream.getTracks().forEach(track => track.stop())
        $remoteMediaStream = null
    }
}
