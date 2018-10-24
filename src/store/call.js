'use strict';

import _ from 'lodash';
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
        number: '',
        numberInput: '',
        localMediaStream: null,
        remoteMediaStream: null,
        audioEnabled: true,
        videoEnabled: true,
        muted: false,
        caller: false,
        callee: false,
        desktopSharingInstall: false,
        dtmf: null
    },
    getters: {
        endedReason(state) {
            return state.endedReason;
        },
        callNumber(state) {
            return state.number;
        },
        callNumberInput(state) {
            return state.numberInput;
        },
        localMediaType(state) {
            if(state.localMediaStream !== null && state.localMediaStream.hasAudio() && state.localMediaStream.hasVideo()) {
                return MediaType.audioVideo;
            }
            else if (state.localMediaStream !== null && state.localMediaStream.hasAudio()) {
                return MediaType.audioOnly;
            }
            else {
                return null;
            }
        },
        remoteMediaType(state) {
            if(state.remoteMediaStream !== null && state.remoteMediaStream.hasAudio() && state.remoteMediaStream.hasVideo()) {
                return MediaType.audioVideo;
            }
            else if (state.remoteMediaStream !== null && state.remoteMediaStream.hasAudio()) {
                return MediaType.audioOnly;
            }
            else {
                return null;
            }
        },
        isNetworkConnected(state) {
            return state.initialized;
        },
        isCallAvailable(state, getters) {
            return getters.isNetworkConnected;
        },
        hasCallInitError(state) {
            return state.initError !== null && state.disabled === false;
        },
        callInitError(state) {
            return state.initError;
        },
        isPreparing(state) {
            return state.callState === CallState.input;
        },
        isInitiating(state) {
            return state.callState === CallState.initiating;
        },
        isIncoming(state) {
            return state.callState === CallState.incoming;
        },
        isTrying(state) {
            return state.callState === CallState.initiating ||
                state.callState === CallState.ringing;
        },
        isRinging(state) {
            return state.callState === CallState.ringing;
        },
        isCalling(state) {
            return state.callState === CallState.initiating ||
                state.callState === CallState.ringing ||
                state.callState === CallState.established ||
                state.callState === CallState.incoming ||
                state.callState === CallState.ended;
        },
        isEstablished(state) {
            return state.callState === CallState.established;
        },
        isEnded(state) {
            return state.callState === CallState.ended;
        },
        hasRtcEngineCapability(state, getters, rootState, rootGetters) {
            return rootGetters['user/hasRtcEngineCapability'];
        },
        hasRtcEngineCapabilityEnabled(state, getters, rootState, rootGetters) {
            return rootGetters['user/hasRtcEngineCapabilityEnabled'];
        },
        hasRemoteVideo(state) {
            return state.remoteMediaStream !== null && state.remoteMediaStream.hasVideo();
        },
        hasLocalVideo(state) {
            return state.localMediaStream !== null && state.localMediaStream.hasVideo();
        },
        hasVideo(state, getters) {
            return getters.hasLocalVideo || getters.hasRemoteVideo;
        },
        isAudioEnabled(state) {
            return state.audioEnabled;
        },
        isVideoEnabled(state) {
            return state.videoEnabled;
        },
        isMuted(state) {
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
        },
        dtmfState(state) {
            return state.dtmf;
        },
        localMediaStream(state) {
            if(state.localMediaStream !== null) {
                return state.localMediaStream.getStream();
            }
            return null;
        },
        remoteMediaStream(state) {
            if(state.remoteMediaStream !== null) {
                return state.remoteMediaStream.getStream();
            }
            return null;
        }

    },
    mutations: {
        numberInputChanged(state, numberInput) {
            state.numberInput = numberInput;
        },
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
            state.number = '';
            state.numberInput = '';
            state.endedReason = null;
        },
        startCalling(state, number) {
            state.number = number;
            state.callState = CallState.initiating;
            state.caller = true;
            state.callee = false;
            state.endedReason = null;
        },
        localMediaSuccess(state, localMediaStream) {
            state.localMediaStream = localMediaStream;
        },
        startRinging(state) {
            state.callState = CallState.ringing;
        },
        stopRinging(state) {
            state.callState = CallState.ended;
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
            state.endedReason = null;
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
            state.number = '';
            state.numberInput = '';
            state.endedReason = null;
        },
        endCall(state, reason) {
            if(state.endedReason === null) {
                state.callState = CallState.ended;
                state.endedReason = reason;
            }
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
        },
        sendDTMF(state, value) {
            state.dtmf = value;
        }
    },
    actions: {
        initialize(context) {
            return new Promise((resolve, reject)=>{
                Vue.call.onIncoming(()=>{
                    context.commit('incomingCall', {
                        number: Vue.call.getNumber()
                    });
                }).onRemoteMedia((remoteMediaStream)=>{
                    context.commit('establishCall', remoteMediaStream);
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
                }
                else {
                    context.commit('disable');
                    resolve();
                }
            });
        },
        start(context, localMedia) {
            let number = context.getters.callNumberInput;
            context.commit('desktopSharingInstallReset');
            context.commit('startCalling', number);
            Promise.resolve().then(()=>{
                return Vue.call.createLocalMedia(localMedia);
            }).then((localMediaStream)=>{
                context.commit('localMediaSuccess', localMediaStream);
                Vue.call.onRingingStart(()=>{
                    context.commit('startRinging');
                }).onRingingStop(()=>{
                    context.commit('stopRinging');
                }).start(number, localMediaStream);
            }).catch((err)=>{
                Vue.call.end();
                if(err.message === 'plugin not detected') {
                    context.commit('desktopSharingInstall');
                    context.commit('endCall', 'missingDesktopSharingExtension');
                }
                else {
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
                }
                else {
                    context.commit('endCall', err.name);
                }
            });
        },
        end(context) {
            Vue.call.end();
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
        sendDTMF(context, value) {
            context.commit('sendDTMF', value);
            if(Vue.call.hasRunningCall()) {
                Vue.call.sendDTMF(value);
            }
        }
    }
};
