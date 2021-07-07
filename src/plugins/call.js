import EventEmitter from 'events'

export const LocalMedia = {
    audioOnly: 'audioOnly',
    audioVideo: 'audioVideo',
    videoOnly: 'videoOnly',
    audioScreen: 'audioScreen',
    screenOnly: 'screenOnly'
}

export class NetworkNotConnected {
    constructor (network) {
        this.name = 'NetworkNotConnected'
        this.message = 'Network ' + network + ' is not connected'
        this.network = network
    }
}

export class CallNotFound {
    constructor () {
        this.name = 'CallNotFound'
        this.message = 'Call not found'
    }
}

export class CallAlreadyExists {
    constructor () {
        this.name = 'CallAlreadyExists'
        this.message = 'Call already exists'
    }
}

let rtcEngineCallInstance = null
export class RtcEngineCall {
    constructor () {
        this.network = null
        this.rtcEngine = null
        this.localMedia = null
        this.remoteMedia = null
        this.currentCall = null
        this.events = new EventEmitter()
        this.endedReason = null
    }

    setRtcEngine (rtcEngine) {
        if (this.rtcEngine === null) {
            this.rtcEngine = rtcEngine
            this.rtcEngine.onSipNetworkConnected(($network) => {
                this.events.emit('connected')
                this.network = $network
                this.network.onIncomingCall((remoteCall) => {
                    if (this.network !== null && this.currentCall === null) {
                        this.currentCall = remoteCall
                        this.currentCall.onEnded(() => {
                            this.events.emit('ended', this.currentCall.endedReason)
                        }).onRemoteMedia((remoteMediaStream) => {
                            this.remoteMedia = remoteMediaStream
                            this.events.emit('remoteMedia', remoteMediaStream)
                        }).onRemoteMediaEnded(() => {
                            this.events.emit('remoteMediaEnded')
                        }).onError((err) => {
                            console.debug(err)
                            this.end()
                            this.events.emit('ended', err.message)
                        })
                    }
                    this.events.emit('incoming')
                })
            }).onSipNetworkDisconnected(() => {
                this.events.emit('disconnected')
            })
        }
    }

    isAvailable () {
        return this.network !== null && this.network.isConnected
    }

    hasRunningCall () {
        return this.currentCall !== null
    }

    createLocalMedia (localMedia) {
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line no-undef
            const localMediaBuilder = cdk.media.create()
            if (localMedia === LocalMedia.audioOnly || localMedia === LocalMedia.audioVideo ||
                localMedia === LocalMedia.audioScreen) {
                localMediaBuilder.enableMicrophone()
            }
            if (localMedia === LocalMedia.audioVideo || localMedia === LocalMedia.videoOnly) {
                localMediaBuilder.enableCamera()
            } else if (localMedia === LocalMedia.audioScreen || localMedia === LocalMedia.screenOnly) {
                localMediaBuilder.enableScreen()
            }
            localMediaBuilder.build().then((localMediaStream) => {
                this.localMedia = localMediaStream
                resolve(this.localMedia)
            }).catch((err) => {
                reject(err)
            })
        })
    }

    start (peer, localMediaStream) {
        if (this.network !== null && this.currentCall === null) {
            peer = peer.replace(/(\s|\+)/, '')
            this.currentCall = this.network.call(peer, {
                localMediaStream: localMediaStream
            })
            this.currentCall.onEnded(() => {
                this.events.emit('ended', this.currentCall.endedReason)
                this.end()
            }).onRemoteMedia((remoteMediaStream) => {
                this.remoteMedia = remoteMediaStream
                this.events.emit('remoteMedia', remoteMediaStream)
            }).onRemoteMediaEnded(() => {
                this.events.emit('remoteMediaEnded')
            }).onAccepted(() => {
                this.events.emit('accepted')
            }).onPending(() => {
                this.events.emit('pending')
            }).onRingingStart(() => {
                this.events.emit('ringingStart')
            }).onRingingStop(() => {
                this.events.emit('ringingStop')
            }).onError((err) => {
                console.debug(err)
                this.end()
                this.events.emit('ended', err.message)
            })
        } else if (this.network !== null) {
            throw new CallAlreadyExists()
        } else {
            throw new NetworkNotConnected(this.networkTag) // TODO: "this.networkTag" is not defined. We should get this variable from somewhere
        }
    }

    getNumber () {
        if (this.currentCall !== null) {
            return this.currentCall.peer
        } else {
            return null
        }
    }

    onIncoming (listener) {
        this.events.on('incoming', listener)
        return this
    }

    onAccepted (listener) {
        this.events.on('accepted', listener)
        return this
    }

    onPending (listener) {
        this.events.on('pending', listener)
        return this
    }

    onRingingStart (listener) {
        this.events.on('ringingStart', listener)
        return this
    }

    onRingingStop (listener) {
        this.events.on('ringingStop', listener)
        return this
    }

    onRemoteMedia (listener) {
        this.events.on('remoteMedia', listener)
        return this
    }

    onRemoteMediaEnded (listener) {
        this.events.on('remoteMediaEnded', listener)
        return this
    }

    onEnded (listener) {
        this.events.on('ended', listener)
        return this
    }

    onConnected (listener) {
        this.events.on('connected', listener)
        return this
    }

    onDisconnected (listener) {
        this.events.on('disconnected', listener)
        return this
    }

    accept (localMediaStream) {
        if (this.currentCall !== null) {
            this.currentCall.accept(localMediaStream).then(() => {
                this.events.emit('locallyAccepted')
            }).catch((err) => {
                console.debug(err)
                this.end()
                this.events.emit('ended', err.message)
            })
        } else {
            throw new Error('Remote call does not exist')
        }
    }

    hangUp () {
        this.end()
    }

    end () {
        if (this.currentCall !== null) {
            this.currentCall.end()
            this.currentCall = null
        }
        this.endMedia()
    }

    endMedia () {
        if (this.localMedia !== null) {
            this.localMedia.stop()
            this.localMedia = null
        }
        if (this.remoteMedia !== null) {
            this.remoteMedia.stop()
            this.remoteMedia = null
        }
    }

    disableAudio () {
        if (this.currentCall !== null) {
            this.currentCall.disableAudio()
        }
    }

    enableAudio () {
        if (this.currentCall !== null) {
            this.currentCall.enableAudio()
        }
    }

    disableVideo () {
        if (this.currentCall !== null) {
            this.currentCall.disableVideo()
        }
    }

    enableVideo () {
        if (this.currentCall !== null) {
            this.currentCall.enableVideo()
        }
    }

    sendDTMF (char) {
        if (this.currentCall !== null) {
            this.currentCall.sendDTMF(char)
        }
    }

    getCall () {
        if (this.currentCall !== null) {
            return this.currentCall
        } else {
            return null
        }
    }

    getLocalMediaId () {
        if (this.localMedia !== null) {
            return this.localMedia.getStream().id
        }
        return null
    }

    getLocalMediaStream () {
        if (this.localMedia !== null) {
            return this.localMedia.getStream()
        }
        return null
    }

    getRemoteMediaId () {
        if (this.remoteMedia !== null) {
            return this.remoteMedia.getStream().id
        }
        return null
    }

    getRemoteMediaStream () {
        if (this.remoteMedia !== null) {
            return this.remoteMedia.getStream()
        }
        return null
    }

    hasRemoteVideo () {
        if (this.remoteMedia !== null) {
            return this.remoteMedia.hasVideo()
        }
        return false
    }

    hasLocalVideo () {
        if (this.localMedia !== null) {
            return this.localMedia.hasVideo()
        }
        return false
    }

    static getInstance () {
        if (rtcEngineCallInstance === null) {
            rtcEngineCallInstance = new RtcEngineCall()
        }
        return rtcEngineCallInstance
    }
}

export default {
    install (Vue) {
        Vue.$call = RtcEngineCall.getInstance()
        Vue.$call.setRtcEngine(Vue.$rtcEngine)
    }
}
