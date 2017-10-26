
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

export class NetworkNotConnected extends Error {

    constructor(network) {
        super();
        this.name = this.constructor.name;
        this.message = 'Network ' + network + ' is not connected';
        this.network = network;
    }
}

var rtcEngineCallInstance = null;
export class RtcEngineCall {

    constructor(options) {
        this.networkTag = 'sip';
        this.client = null;
        this.network = null;
        this.currentCall = null;
        this.loadedLibrary = null;
        this.sessionToken = null;
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
        return this.currentCall !== null;
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
                    resolve(localMediaStream);
                }
            });
        });
    }

    start(peer, localMediaStream) {
        peer = peer.replace('+', '');
        if(this.network !== null) {
            this.currentCall = this.network.call(peer, { localMediaStream: localMediaStream });
            return this.currentCall;
        } else {
            throw new NetworkNotConnected(this.networkTag);
        }
    }

    onIncoming(listener) {
        if(this.network !== null) {
            this.network.onIncomingCall((call)=>{
                if(this.currentCall === null) {
                    this.currentCall = call;
                    listener(call);
                }
            });
        } else {
            throw new NetworkNotConnected(this.networkTag);
        }
    }

    accept(localMediaStream) {
        if(this.currentCall !== null) {
            this.currentCall.accept({
                localMediaStream: localMediaStream
            });
        }
    }

    hangUp() {
        if(this.currentCall !== null) {
            this.currentCall.end();
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
