'use strict';

// import { loadCdkLib, connectDefaultCdkNetwork } from '../helpers/cdk-lib';
// import { createSessionToken } from '../api/rtcsession';

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
            return state.initError !== null;
        },
        isPreparing(state, getters) {
            return state.callState === CallState.input;
        },
        isInitiating(state, getters) {
            return state.callState === CallState.initiating;
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
        isEnded(state, getters) {
            return state.callState === CallState.ended;
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
        inputNumber(state) {
            state.callState = CallState.input;
        },
        startCalling(state, options) {
            state.number = options.number;
            state.mediaType = options.mediaType;
            state.localMediaType = state.mediaType;
            state.localMediaStream = options.localMediaStream;
            state.callState = CallState.initiating;
        },
        acceptIncoming(state, options) {
            state.localMediaStream = options.localMediaStream;
        },
        startRinging(state) {
            state.callState = CallState.ringing;
        },
        establishCall(state, options) {
            state.remoteMediaStream = options.remoteMediaStream;
            state.callState = CallState.established;
        },
        incomingCall(state, options) {
            state.callState = CallState.incoming;
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
                Vue.call.initialize().then(()=>{
                    context.commit('initSucceeded');
                    Vue.call.onIncoming((call)=>{
                        context.commit('incomingCall');
                        call.onRemoteMedia((remoteMediaStream)=>{
                            context.commit('establishCall', {
                                remoteMediaStream: remoteMediaStream
                            });
                        }).onRemoteMediaEnded(()=>{
                            context.commit("endRemoteMedia");
                        }).onEnded(()=>{
                            context.commit('endCall', call.endedReason);
                        });
                    });
                    resolve();
                }).catch((err)=>{
                    context.commit('initFailed', err);
                    reject(err);
                });
            });
        },
        /**
         * @param context
         * @param options
         * @param options.localMedia
         * @param options.number
         */
        start(context, options) {
            Vue.call.createLocalMedia(options.localMedia).then((localMediaStream)=>{
                var call = Vue.call.start(options.number, localMediaStream);
                call.onAccepted(()=>{
                    }).onEnded(()=>{
                        context.commit('endCall', call.endedReason);

                    }).onPending(()=>{
                        context.commit('startCalling', {
                            number: options.number,
                            mediaType: options.localMedia,
                            localMediaStream: localMediaStream
                        });
                    }).onRemoteMedia((remoteMediaStream)=>{
                        context.commit('establishCall', {
                            remoteMediaStream: remoteMediaStream
                        });
                    }).onRemoteMediaEnded(()=>{
                        context.commit("endRemoteMedia");
                    }).onRingingStart(()=>{
                        context.commit('startRinging');
                    }).onRingingStop(()=>{
                        context.commit('stopRinging');
                    });
            }).catch((err)=>{
                context.commit('endCall', err.name);
            });
        },
        accept(context, localMedia) {
            Vue.call.createLocalMedia(localMedia).then((localMediaStream)=>{
                Vue.call.accept(localMediaStream);
                context.commit('acceptIncoming', {
                    localMediaStream: localMediaStream
                });
            }).catch((err)=>{
                context.commit('endCall', 'localMediaError');
            });
        },
        hangUp(context) {
            if(Vue.call.hasRunningCall()) {
                Vue.call.hangUp();
                context.commit('hangUpCall');
            } else {
                context.commit('endCall', 'noRunningCall');
            }
        }
    }
};
