
import EventEmitter from 'events';
import _ from 'lodash';
import { loadCdkLib, connectDefaultCdkNetwork } from '../helpers/cdk-lib';
import { createSessionToken } from '../api/rtcsession';

export const LocalMedia = {
    audioOnly: 'audioOnly',
    audioVideo: 'audioVideo',
    videoOnly: 'videoOnly',
    audioScreen: 'audioScreen',
    screenOnly: 'screenOnly'
};

export class NetworkNotConnected {

    constructor(network) {
        this.name = "NetworkNotConnected";
        this.message = 'Network ' + network + ' is not connected';
        this.network = network;
    }
}

export class CallNotFound {

    constructor() {
        this.name = "CallNotFound";
        this.message = 'Call not found';
    }
}

export class CallAlreadyExists {

    constructor() {
        this.name = "CallAlreadyExists";
        this.message = 'Call already exists';
    }
}

var rtcEngineCallInstance = null;
export class RtcEngineCall {

    constructor(options) {
        this.networkTag = 'sip';
        this.client = null;
        this.network = null;
        this.loadedLibrary = null;
        this.sessionToken = null;
        this.localCall = null;
        this.localMedia = null;
        this.remoteCall = null;
        this.remoteMedia = null;
        this.events = new EventEmitter();
    }

    initialize() {
        return new Promise((resolve, reject)=>{
            Promise.resolve().then(($loadedLibrary)=>{
                this.loadedLibrary = $loadedLibrary;
                return this.loadLibrary();
            }).then(()=>{
                return this.createSession();
            }).then(($sessionToken)=>{
                this.sessionToken = $sessionToken;
                return this.connectNetwork($sessionToken);
            }).then(($network)=>{
                this.network = $network;
                this.network.onIncomingCall((remoteCall)=>{
                    if(this.network !== null && this.remoteCall === null) {
                        this.remoteCall = remoteCall;
                        this.remoteCall.onEnded(()=>{
                            this.events.emit('ended', this.remoteCall.endedReason);
                        }).onRemoteMedia((remoteMediaStream)=>{
                            this.events.emit('remoteMedia', remoteMediaStream);
                        }).onRemoteMediaEnded(()=>{
                            this.events.emit('remoteMediaEnded');
                        });
                    }
                    this.events.emit('incoming');
                });
                resolve();
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    isAvailable() {
        return this.network !== null && this.network.isConnected;
    }

    hasRunningCall() {
        return this.localCall !== null || this.remoteCall !== null;
    }

    loadLibrary() {
        return loadCdkLib();
    }

    createSession() {
        return createSessionToken();
    }

    connectNetwork(session) {
        return connectDefaultCdkNetwork(session);
    }

    createLocalMedia(localMedia) {
        return new Promise((resolve, reject)=>{
            var localMediaStream = new cdk.LocalMediaStream();
            var hasAudio = localMedia === LocalMedia.audioOnly ||
                localMedia === LocalMedia.audioVideo ||
                localMedia === LocalMedia.audioScreen;
            var hasVideo = localMedia === LocalMedia.audioVideo ||
                localMedia === LocalMedia.videoOnly;
            var hasScreen = localMedia === LocalMedia.audioScreen ||
                localMedia === LocalMedia.screenOnly;

            localMediaStream.queryMediaSources((sources) => {
                if (hasAudio && _.isObject(sources.defaultAudio)) {
                    localMediaStream.setAudio(sources.defaultAudio);
                }
                if (hasVideo && _.isObject(sources.defaultVideo)) {
                    localMediaStream.setVideo(sources.defaultVideo);
                } else if (hasScreen && _.isObject(sources.desktopSharing)) {
                    localMediaStream.setVideo(sources.desktopSharing);
                }
            });
            localMediaStream.build((err)=>{
                if(_.isObject(err)) {
                    reject(err);
                } else {
                    this.localMedia = localMediaStream;
                    resolve(localMediaStream);
                }
            });
        });
    }

    start(peer, localMediaStream) {
        if(this.network !== null && this.localCall === null) {
            peer = peer.replace(/(\s|\+)/,'');
            this.localCall = this.network.call(peer, {
                localMediaStream: localMediaStream
            });
            this.localCall.onEnded(()=>{
                this.events.emit('ended', this.localCall.endedReason);
                this.end();
            }).onPending(()=>{
                this.events.emit('pending');
            }).onRemoteMedia((remoteMediaStream)=>{
                this.events.emit('remoteMedia', remoteMediaStream);
            }).onRemoteMediaEnded(()=>{
                this.events.emit('remoteMediaEnded');
            }).onRingingStart(()=>{
                this.events.emit('ringingStart');
            }).onRingingStop(()=>{
                this.events.emit('ringingStop');
            });
        } else if(this.network !== null)  {
            throw new CallAlreadyExists();
        } else {
            throw new NetworkNotConnected(this.networkTag);
        }
    }

    getNumber() {
        if(this.localCall !== null) {
            return this.localCall.peer;
        } else if(this.remoteCall !== null) {
            return this.remoteCall.peer;
        } else {
            return null;
        }
    }

    getEndedReason() {
        if(this.localCall !== null) {
            return this.localCall.endedReason;
        } else if(this.remoteCall !== null) {
            return this.remoteCall.endedReason;
        } else {
            return null;
        }
    }

    onIncoming(listener) {
        this.events.on('incoming', listener);
        return this;
    }

    onPending(listener) {
        this.events.on('pending', listener);
        return this;
    }

    onRingingStart(listener) {
        this.events.on('ringingStart', listener);
        return this;
    }

    onRingingStop(listener) {
        this.events.on('ringingStop', listener);
        return this;
    }

    onRemoteMedia(listener) {
        this.events.on('remoteMedia', listener);
        return this;
    }

    onRemoteMediaEnded(listener) {
        this.events.on('remoteMediaEnded', listener);
        return this;
    }

    onEnded(listener) {
        this.events.on('ended', listener);
        return this;
    }

    accept(localMediaStream) {
        if(this.remoteCall !== null) {
            this.remoteCall.accept({
                localMediaStream: localMediaStream
            });
        }
    }

    hangUp() {
        this.end();
    }

    end() {
        if(this.localCall !== null) {
            this.localCall.end();
            this.localCall = null;
        }
        if(this.remoteCall !== null) {
            this.remoteCall.end();
            this.remoteCall = null;
        }
        if(this.localMedia !== null) {
            this.localMedia.stop();
            this.localMedia = null;
        }
    }

    static getInstance() {
        if(rtcEngineCallInstance === null) {
            rtcEngineCallInstance = new RtcEngineCall();
        }
        return rtcEngineCallInstance;
    }

    static install(Vue, options) {
        Vue.call = RtcEngineCall.getInstance();
    }
}
