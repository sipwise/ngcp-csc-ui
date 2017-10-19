'use strict';

import { loadCdkLib, connectDefaultCdkNetwork } from '../helpers/cdk-lib';
import { createSessionToken } from '../api/rtcsession';

var cdkNetwork = null;

export default {
    namespaced: true,
    state: {
        loaded: false,
        initFailure: false,
        connected: false,
        disconnectReason: '',
        incoming: false,
        incomingNumber: '',
        outgoing: false,
        outgoingNumber: ''
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

        },
        outgoing(state) {

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
        call(context) {

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
