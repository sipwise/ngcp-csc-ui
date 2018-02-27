'use strict';

import Vue from 'vue';

export var CallState = {
    input: 'input',
    initiating: 'initiating',
    ringing: 'ringing',
    incoming: 'incoming',
    established: 'established',
    ended: 'ended'
};

export var MediaType = {
    audioOnly: 'audioOnly',
    audioVideo: 'audioVideo',
    audioScreen: 'audioScreen'
};

export default {
    namespaced: true,
    state: {
        initialized: false,
        initError: null,
        disabled: false,
        endedReason: null,
        callState: CallState.input,
        number: null,
        localMediaStream: null,
        remoteMediaStream: null,
        audioEnabled: true,
        videoEnabled: true,
        muted: false,
        caller: false,
        callee: false,
        desktopSharingInstall: false
    },
    getters: {
        getNumber(state, getters) {
            return state.number;
        },
        localMediaType(state) {
            if(state.localMediaStream !== null && state.localMediaStream.hasAudio() && state.localMediaStream.hasVideo()) {
                return MediaType.audioVideo;
            } else if (state.localMediaStream !== null && state.localMediaStream.hasAudio()) {
                return MediaType.audioOnly;
            } else {
                return null;
            }
        },
        remoteMediaType(state) {
            if(state.remoteMediaStream !== null && state.remoteMediaStream.hasAudio() && state.remoteMediaStream.hasVideo()) {
                return MediaType.audioVideo;
            } else if (state.remoteMediaStream !== null && state.remoteMediaStream.hasAudio()) {
                return MediaType.audioOnly;
            } else {
                return null;
            }
        },
        getEndedReason(state, getters) {
            return state.endedReason;
        },
        isNetworkConnected(state, getters) {
            return state.initialized;
        },
        isCallAvailable(state, getters) {
            return getters.isNetworkConnected;
        },
        hasCallInitFailure(state, getters) {
            return state.initError !== null && state.disabled === false;
        },
        isPreparing(state, getters) {
            return state.callState === CallState.input;
        },
        isInitiating(state, getters) {
            return state.callState === CallState.initiating;
        },
        isIncoming(state, getters) {
            return state.callState === CallState.incoming;
        },
        isTrying(state, getters) {
            return state.callState === CallState.initiating ||
                state.callState === CallState.ringing;
        },
        isRinging(state, getters) {
            return state.callState === CallState.ringing;
        },
        isCalling(state, getters) {
            return state.callState === CallState.initiating ||
                state.callState === CallState.ringing ||
                state.callState === CallState.established;
        },
        isEstablished(state, getters) {
            return state.callState === CallState.established;
        },
        isEnded(state, getters) {
            return state.callState === CallState.ended;
        },
        hasRtcEngineCapability(state, getters, rootState, rootGetters) {
            return rootGetters['user/hasRtcEngineCapability'];
        },
        hasRtcEngineCapabilityEnabled(state, getters, rootState, rootGetters) {
            return rootGetters['user/hasRtcEngineCapabilityEnabled'];
        },
        hasRemoteVideo(state, getters) {
            return state.remoteMediaStream !== null && state.remoteMediaStream.hasVideo();
        },
        hasLocalVideo(state, getters) {
            return state.localMediaStream !== null && state.localMediaStream.hasVideo();
        },
        hasVideo(state, getters) {
            return getters.hasLocalVideo || getters.hasRemoteVideo;
        },
        isAudioEnabled(state, getters) {
            return state.audioEnabled;
        },
        isVideoEnabled(state, getters) {
            return state.videoEnabled;
        },
        isMuted(state, getters) {
            return state.muted;
        },
        isCaller(state) {
            return state.caller;
        },
        isCallee(state) {
            return state.callee;
        },
        callState(state) {
            return state.callState;
        },
        desktopSharingInstall(state) {
            return state.desktopSharingInstall;
        }
    },
    mutations: {
        initSucceeded(state) {
            state.initialized = true;
            state.initError = null;
        },
        initFailed(state, err) {
            state.initialized = false;
            state.initError = err;
        },
        disable(state) {
            state.disabled = true;
        },
        inputNumber(state) {
            state.callState = CallState.input;
        },
        startCalling(state, options) {
            state.number = options.number;
            state.callState = CallState.initiating;
            state.caller = true;
            state.callee = false;
        },
        localMediaSuccess(state, localMediaStream) {
            state.localMediaStream = localMediaStream;
        },
        startRinging(state) {
            state.callState = CallState.ringing;
        },
        establishCall(state, remoteMediaStream) {
            state.remoteMediaStream = remoteMediaStream;
            state.callState = CallState.established;
            state.audioEnabled = true;
            state.videoEnabled = true;
            state.muted = false;
        },
        incomingCall(state, options) {
            state.callState = CallState.incoming;
            state.number = options.number;
            state.callee = true;
            state.caller = false;
        },
        hangUpCall(state) {
            state.callState = CallState.input;
            if(_.isObject(state.localMediaStream)) {
                state.localMediaStream.stop();
                state.localMediaStream = null;
            }
            if(_.isObject(state.remoteMediaStream)) {
                state.remoteMediaStream.stop();
                state.remoteMediaStream = null;
            }
        },
        endCall(state, reason) {
            state.callState = CallState.ended;
            state.endedReason = reason;
            if(_.isObject(state.localMediaStream)) {
                state.localMediaStream.stop();
                state.localMediaStream = null;
            }
            if(_.isObject(state.remoteMediaStream)) {
                state.remoteMediaStream.stop();
                state.remoteMediaStream = null;
            }
        },
        disableAudio(state) {
            state.audioEnabled = false;
        },
        enableAudio(state) {
            state.audioEnabled = true;
        },
        disableVideo(state) {
            state.videoEnabled = false;
        },
        enableVideo(state) {
            state.videoEnabled = true;
        },
        mute(state) {
            state.muted = true;
        },
        unmute(state) {
            state.muted = false;
        },
        desktopSharingInstallReset(state)  {
            state.desktopSharingInstall = false;
        },
        desktopSharingInstall(state)  {
            state.desktopSharingInstall = true;
        }
    },
    actions: {
        initialize(context) {
            return new Promise((resolve, reject)=>{
                Vue.call.onIncoming(()=>{
                    context.commit('layout/showRight', null, { root: true });
                    context.commit('incomingCall', {
                        number: Vue.call.getNumber()
                    });
                }).onRemoteMedia((remoteMediaStream)=>{
                    context.commit('establishCall', remoteMediaStream);
                }).onRemoteMediaEnded(()=>{
                    context.commit("endRemoteMedia");
                }).onEnded(()=>{
                    Vue.call.end();
                    context.commit('endCall', Vue.call.getEndedReason());
                });
                if(context.getters.hasRtcEngineCapabilityEnabled) {
                    Vue.call.initialize().then(()=>{
                        context.commit('initSucceeded');
                        resolve();
                    }).catch((err)=>{
                        context.commit('initFailed', err);
                        reject(err);
                    });
                } else {
                    context.commit('disable');
                    resolve();
                }
            });
        },
        start(context, options) {
            context.commit('desktopSharingInstallReset');
            context.commit('layout/showRight', null, { root: true });
            context.commit('startCalling', { number: options.number });
            Promise.resolve().then(()=>{
                return Vue.call.createLocalMedia(options.localMedia);
            }).then((localMediaStream)=>{
                context.commit('localMediaSuccess', localMediaStream);
                Vue.call.onRingingStart(()=>{
                    context.commit('startRinging');
                }).onRingingStop(()=>{
                    context.commit('stopRinging');
                }).start(options.number, localMediaStream);
            }).catch((err)=>{
                Vue.call.end();
                if(err.message === 'plugin not detected') {
                    context.commit('desktopSharingInstall');
                    context.commit('endCall', 'missingDesktopSharingExtension');
                } else {
                    context.commit('endCall', err.name);
                }
            });
        },
        accept(context, localMedia) {
            context.commit('desktopSharingInstallReset');
            Vue.call.createLocalMedia(localMedia).then((localMediaStream)=>{
                Vue.call.accept(localMediaStream);
                context.commit('localMediaSuccess', localMediaStream);
            }).catch((err)=>{
                Vue.call.end();
                if(err.message === 'plugin not detected') {
                    context.commit('desktopSharingInstall');
                    context.commit('endCall', 'missingDesktopSharingExtension');
                } else {
                    context.commit('endCall', err.name);
                }
            });
        },
        hangUp(context) {
            Vue.call.hangUp();
            context.commit('hangUpCall');
        },
        disableAudio(context) {
            Vue.call.disableAudio();
            context.commit('disableAudio');
        },
        enableAudio(context) {
            Vue.call.enableAudio();
            context.commit('enableAudio');
        },
        disableVideo(context) {
            Vue.call.disableVideo();
            context.commit('disableVideo');
        },
        enableVideo(context) {
            Vue.call.enableVideo();
            context.commit('enableVideo');
        },
        showCall(context) {
            context.commit('layout/showRight', null, { root: true });
        },
        hideCall() {
            context.commit('layout/hideRight', null, { root: true });
        }
    }
};
