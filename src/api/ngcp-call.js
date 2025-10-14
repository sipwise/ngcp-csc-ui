import { EventEmitter } from 'events'

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
let $iceServers = []
let $pendingIceCandidates = []

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
    return `sip:${$subscriber.username}@${$subscriber.domain}`
}

function createTrickleIceSdpFragment (candidateInfo) {
    /**
     * Convert ICE candidate to SDP fragment format (RFC 8840)
     * Must include m= line, a=mid: line, and a=candidate: line
     * RFC Rules:
     * The media field is set to 'audio'.
     * The port value is set to '9'.
     * The proto value is set to 'RTP/AVP'.
     * The fmt field MUST appear only once and is set to '0'.

     * Example output:
     * m=audio 9 RTP/AVP 0
     * a=mid:0
     * a=candidate:foundation 1 udp 2113667326 192.168.1.100 54400 typ host
     */
    let sdpFragment = ''

    sdpFragment += 'm=audio 9 RTP/AVP 0\r\n'

    // Include media ID if we have it
    if (candidateInfo.sdpMid) {
        sdpFragment += `a=mid:${candidateInfo.sdpMid}\r\n`
    }

    // The actual ICE candidate
    sdpFragment += `a=${candidateInfo.candidate}`

    return sdpFragment
}

/**
 * Send any ICE candidates we collected before the call was fully established.
 *
 * Problem: ICE candidates start showing up immediately when we create the peer connection,
 * but we can't send SIP INFO messages until the call is actually confirmed. So we queue
 * them up and send them all at once when the call is ready.
 *
 * This fixes issues with video calls where we get important candidates
 * after the initial call setup.
 */
function sendQueuedIceCandidates (rtcSession) {
    if ($pendingIceCandidates.length === 0) {
        return
    }

    const candidates = [...$pendingIceCandidates]
    $pendingIceCandidates = []

    candidates.forEach((candidateInfo, index) => {
        try {
            const sdpFragment = createTrickleIceSdpFragment(candidateInfo)

            rtcSession.sendInfo('application/trickle-ice-sdpfrag', sdpFragment, {
                extraHeaders: [
                    'Info-Package: trickle-ice',
                    'Content-Disposition: Info-Package'
                ],
                eventHandlers: {
                    succeeded: () => {
                        callEvent.emit('iceCandidateSent', candidateInfo)
                    },
                    failed: (e) => {
                        callEvent.emit('iceCandidateFailed', { candidate: candidateInfo, error: e })
                    }
                }
            })
        } catch (error) {
            callEvent.emit('iceCandidateFailed', { candidate: candidateInfo, error })
        }
    })
}

function handleIceCandidate (event, rtcSession) {
    if (event.candidate) {
        // Got a new ICE candidate - send it to the other side via SIP INFO
        try {
            const candidateInfo = {
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex
            }

            /**
             * Status 9 = confirmed, 12 = ended
             *
             * Why did we include 12?
             * It handles the gap between "SIP says the call is over"
             * and "WebRTC finishes cleaning up the connection."
             */
            if (rtcSession.status === 9 || rtcSession.status === 12) {
                const sdpFragment = createTrickleIceSdpFragment(candidateInfo)

                rtcSession.sendInfo('application/trickle-ice-sdpfrag', sdpFragment, {
                    extraHeaders: [
                        'Info-Package: trickle-ice',
                        'Content-Disposition: Info-Package'
                    ],
                    eventHandlers: {
                        succeeded: () => {
                            callEvent.emit('iceCandidateSent', candidateInfo)
                        },
                        failed: (e) => {
                            callEvent.emit('iceCandidateFailed', { candidate: candidateInfo, error: e })
                        }
                    }
                })
            } else {
                $pendingIceCandidates.push(candidateInfo)
            }
        } catch (error) {
            callEvent.emit('iceCandidateError', error)
        }
    } else {
        callEvent.emit('iceGatheringComplete')
    }
}

// WebSocket Authentication to Kamailio
function callCreateSocket () {
    return new jssip.WebSocketInterface(`${$baseWebSocketUrl}/${$subscriber.username}`)
}

export function callConfigure ({ baseWebSocketUrl, iceServers }) {
    $baseWebSocketUrl = baseWebSocketUrl
    if (iceServers && Array.isArray(iceServers)) {
        $iceServers = iceServers
    }
}

export async function callInitialize ({ subscriber, instanceId }) {
    $subscriber = subscriber
    callRegister({ instanceId })
}
// Set up SIP connection and register with server
export function callRegister ({ instanceId }) {
    if (!$socket) {
        $socket = callCreateSocket()
        const config = {
            sockets: [$socket],
            uri: getSubscriberUri(),
            password: $subscriber.password,
            instance_id: instanceId,
            // WebRTC settings for proper ICE handling
            pcConfig: {
                iceServers: $iceServers,
                iceCandidatePoolSize: 10,
                bundlePolicy: 'max-bundle',
                rtcpMuxPolicy: 'require'
            }
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

        // Handle incoming ICE candidates via SIP INFO messages
        $userAgent.on('newMessage', (event) => {
            if (event.request.getHeader('Content-Type') === 'application/trickle-ice-sdpfrag') {
                try {
                    const sdpFragment = event.request.body

                    // Extract candidate from SDP fragment format: a=candidate:...
                    const candidateMatch = sdpFragment.match(/a=candidate:(.+)/)
                    if (candidateMatch) {
                        const candidateString = `candidate:${candidateMatch[1]}`

                        // Extract sdpMid from a=mid: line
                        const midMatch = sdpFragment.match(/a=mid:(.+)/)
                        const sdpMid = midMatch ? midMatch[1].trim() : null

                        // Extract sdpMLineIndex from m= line position
                        // Parse media type to determine line index (audio=0, video=1)
                        const mediaMatch = sdpFragment.match(/m=(\w+)/)
                        let sdpMLineIndex = null
                        if (mediaMatch) {
                            const mediaType = mediaMatch[1]
                            sdpMLineIndex = mediaType === 'video' ? 1 : 0
                        }

                        const rtcSession = callGetRtcSession()
                        if (rtcSession && rtcSession.connection) {
                            const candidate = new RTCIceCandidate({
                                candidate: candidateString,
                                sdpMid,
                                sdpMLineIndex
                            })

                            rtcSession.connection.addIceCandidate(candidate)
                                .then(() => {
                                    callEvent.emit('iceCandidateReceived', {
                                        candidate: candidateString,
                                        sdpMid,
                                        sdpMLineIndex
                                    })
                                })
                                .catch((error) => {
                                    callEvent.emit('iceCandidateAddError', error)
                                })
                        }
                    }
                    event.reply(200, 'OK')
                } catch (error) {
                    callEvent.emit('iceCandidateParseError', error)
                    event.reply(400, 'Bad Request')
                }
            }
        })
        $userAgent.on('newRTCSession', (event) => {
            if (event.originator === 'remote') {
                if ($incomingRtcSession || $outgoingRtcSession) {
                    event.session.terminate({
                        status_code: 486,
                        reason_phrase: 'Busy'
                    })
                } else {
                    $incomingRtcSession = event.session
                    $incomingRtcSession.on('peerconnection', () => {
                        $incomingRtcSession.connection.ontrack = handleRemoteMediaStream
                        // Handle trickle ICE for incoming calls
                        $incomingRtcSession.connection.onicecandidate = (candidateEvent) => {
                            handleIceCandidate(candidateEvent, $incomingRtcSession)
                        }
                    })
                    $incomingRtcSession.on('failed', (failedEvent) => {
                        callEvent.emit('incomingFailed', failedEvent)
                    })
                    $incomingRtcSession.on('ended', (failedEvent) => {
                        callEvent.emit('incomingEnded', failedEvent)
                        $incomingRtcSession = null
                    })
                    callEvent.emit('incoming', $incomingRtcSession)
                    $incomingRtcSession.on('hold', (holdEvent) => {
                        callEvent.emit('incomingHold', holdEvent)
                    })
                    $incomingRtcSession.on('unhold', (unholdEvent) => {
                        callEvent.emit('incomingUnHold', unholdEvent)
                    })
                    $incomingRtcSession.on('refer', (event) => {
                        callEvent.emit('incomingRefer', event)
                    })
                }
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

// SIP INVITE - Start call request
export async function callStart ({ number }) {
    try {
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
                    // Send any queued ICE candidates now that session is confirmed
                    sendQueuedIceCandidates($outgoingRtcSession)
                },
                ended (event) {
                    callEvent.emit('outgoingEnded', event)
                    $outgoingRtcSession = null
                },
                hold (event) {
                    if (event.originator === 'local') {
                        callEvent.emit('outgoingHold', event)
                    } else {
                        callEvent.emit('outgoingHolded', event)
                    }
                },
                unhold (event) {
                    if (event.originator === 'local') {
                        callEvent.emit('outgoingUnHold', event)
                    } else {
                        callEvent.emit('outgoingUnHolded', event)
                    }
                },
                refer (event) {
                    callEvent.emit('outgoingRefer', event)
                }

            },
            mediaStream: $localMediaStream
        })
        $outgoingRtcSession.connection.ontrack = handleRemoteMediaStream
        // Handle trickle ICE for outgoing calls
        $outgoingRtcSession.connection.onicecandidate = (candidateEvent) => {
            handleIceCandidate(candidateEvent, $outgoingRtcSession)
        }
        return true
    } catch (e) {
        return false
    }
}

export async function callAccept () {
    try {
        $localMediaStream = await callCreateLocalAudioStream()
        callEvent.emit('localStream', $localMediaStream)
        if ($incomingRtcSession) {
            $incomingRtcSession.answer({
                mediaStream: $localMediaStream
            })
        }
    } catch (e) {
        callEvent.emit('incomingFailed', { cause: e })
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

export async function callSendVideo (stream) {
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
    const originalVideoScreenState = $isVideoScreen
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: callGetScreenConstraints(),
            audio: false
        })
        $isVideoScreen = true
        await callSendVideo(stream)
    } catch (error) {
        // Reset state to original value if screen sharing fails
        // and throw a error that can be displayed in UI
        $isVideoScreen = originalVideoScreenState
        throw error
    }
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
            $localMediaStream.getTracks().forEach((track) => track.stop())
        }
    } finally {
        $localMediaStream = null
    }
    try {
        if ($remoteMediaStream) {
            $remoteMediaStream.getTracks().forEach((track) => track.stop())
        }
    } finally {
        $remoteMediaStream = null
    }
    $outgoingRtcSession = null
    $incomingRtcSession = null
    $audioTransceiver = null
    $videoTransceiver = null
}
/**
 * Hold on.
 */
export function callToggleHold () {
    const rtcSession = callGetRtcSession()
    if (rtcSession) {
        if (rtcSession.isOnHold().local) {
            rtcSession.unhold()
        } else {
            rtcSession.hold()
        }
    }
}
/**
 * Blind Transfer.
 */
export function callBlindTransfer (numberToTransfer) {
    return new Promise((resolve, reject) => {
        const rtcSession = callGetRtcSession()
        const eventHandlers = {
            requestFailed: function (e) {
                reject(new Error('Transfer failed'))
            },
            requestSucceeded: function (e) {
                resolve(true)
            }
        }
        try {
            const uriString = `Referred-By: <sip:${rtcSession.local_identity.uri.user}@${rtcSession.local_identity.uri.host}>`
            rtcSession.refer(numberToTransfer, {
                eventHandlers,
                extraHeaders: [
                    uriString
                ]
            })
        } catch (err) {
            reject(err)
        }
    })
}
