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
    audio: 'audio',
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
        mediaType: null,
        localMediaType: null,
        localMediaStream: null,
        remoteMediaStream: null
    },
    getters: {
        getNumber(state, getters) {
            return state.number;
        },
        getMediaType(state, getters) {
            return state.mediaType;
        },
        getLocalMediaType(state, getters) {
            return state.localMediaType
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
            return state.initError !== null && !state.disabled;
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
            return false; //rootGetters['user/hasRtcEngineCapability'];
        },
        hasRtcEngineCapabilityEnabled(state, getters, rootState, rootGetters) {
            return rootGetters['user/hasRtcEngineCapabilityEnabled'];
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
            state.mediaType = options.mediaType;
            state.localMediaType = state.mediaType;
            state.callState = CallState.initiating;
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
        },
        incomingCall(state, options) {
            state.callState = CallState.incoming;
            state.number = options.number;
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
        /**
         * @param context
         * @param options
         * @param options.localMedia
         * @param options.number
         */
        start(context, options) {
            context.commit('layout/showRight', null, { root: true });
            context.commit('startCalling', {
                number: options.number,
                mediaType: options.localMedia });
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
                context.commit('endCall', err.name);
                Vue.call.end();
            });
        },
        accept(context, localMedia) {
            Vue.call.createLocalMedia(localMedia).then((localMediaStream)=>{
                Vue.call.accept(localMediaStream);
                context.commit('localMediaSuccess', localMediaStream);
            }).catch((err)=>{
                Vue.call.end();
                context.commit('endCall', 'localMediaError');
            });
        },
        hangUp(context) {
            Vue.call.hangUp();
            context.commit('hangUpCall');
        }
    }
};
