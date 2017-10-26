'use strict';

import { loadCdkLib, connectDefaultCdkNetwork } from '../helpers/cdk-lib';
import { createSessionToken } from '../api/rtcsession';

var cdkNetwork = null;
var cdkCall = null;

export var CallState = {
    input: 'input',
    calling: 'calling',
    ringing: 'ringing',
    incoming: 'incoming',
    established: 'established',
    ended: 'ended'
};

export var MediaType = {
    audio: 'audio',
    audioVideo: 'audioVideo'
};

export default {
    namespaced: true,
    state: {
        loaded: false,
        initFailure: false,
        connected: false,
        disconnectReason: '',
        number: '',
        mediaType: '',
        state: CallState.input,
        remoteStream: '',
    },
    getters: {
        isCallAvailable(state, getters) {
            return state.loaded && state.connected;
        },
        hasCallInitFailure(state, getters) {
            return state.initFailure;
        }
    },
    mutations: {
        load(state) {
            state.loaded = true;
        },
        initFailure(state) {
            state.initFailure = true;
        },
        connect(state) {
            state.connected = true;
        },
        disconnect(state, reason) {
            state.connected = false;
            state.disconnectReason = reason;
        },
        incoming(state) {
            state.callState = CallState.incoming;
        },
        call(state) {
            state.callState = CallState.calling;
        },
        callFails(state, reason) {

        },
        ring(state) {
            state.callState = CallState.ringing;
        },
        remoteMedia(state) {

        },
        establish(state) {
            state.callState = CallState.established;
        },
        end(state) {
            state.callState = CallState.ended;
        }
    },
    actions: {
        initialize(context) {
            return new Promise((resolve, reject)=>{
                if(context.rootState.user.capabilities.rtcengine) {
                    loadCdkLib().then((script)=>{
                        context.commit('load');
                        return createSessionToken();
                    }).then((sessionToken)=>{
                        return connectDefaultCdkNetwork(sessionToken);
                    }).then(($cdkNetwork)=>{
                        cdkNetwork = $cdkNetwork;
                        cdkNetwork.getClient().onConnect(()=>{
                            context.commit('connect');
                        });
                        cdkNetwork.getClient().onDisconnect(()=>{
                            context.commit('disconnect', cdkNetwork.disconnectReason);
                        });
                        context.commit('connect');
                        resolve();
                    }).catch((err)=>{
                        context.commit('initFailure');
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        },
        call(context, options) {
            if(cdkNetwork !== null) {
                cdkCall = cdkNetwork.call(options.number, options);
                cdkCall
                    .onAccepted(()=>{

                    })
                    .onEnded(()=>{

                    })
                    .onPending(()=>{
                        context.commit('call');
                    })
                    .onRemoteMedia(()=>{
                        context.commit('')
                    })
                    .onRemoteMediaEnded(()=>{

                    })
                    .onRingingStart(()=>{
                        context.commit('ring');
                    })
                    .onRingingStop(()=>{

                    });
            } else {
                context.commit('callFails');
            }
        },
        connect(context, sessionToken) {
        },
        disconnect(context) {

        },
        enableAudio(context) {

        },
        disableAudio(context) {

        },
        enableVideo(context) {

        },
        disableVideo(context) {

        }
    }
};
