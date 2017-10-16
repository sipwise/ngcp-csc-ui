'use strict';

import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'

import UserModule from './user'
import PbxGroupsModule from './pbx-groups'
import CallBlockingModule from './call-blocking'
import ReminderModule from './reminder'

var rtcEngineClient = null;
var rtcEngineNetwork = null;

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        user: UserModule,
        pbxGroups: PbxGroupsModule,
        callBlocking: CallBlockingModule,
        reminder: ReminderModule
    },
    state: {
        rtcEngineConnected: false
    },
    getters: {},
    mutations: {
        disconnectRtcEngine(state) {
            state.rtcEngineConnected = false;
        },
        connectRtcEngine(state) {
            state.rtcEngineConnected = true;
        }
    },
    actions: {
        createRtcEngineSession(context) {
            return new Promise((resolve, reject)=>{
                Promise.resolve().then(()=>{
                    return Vue.http.post('/api/rtcsessions/');
                }).then((res)=>{
                    return Vue.http.get(res.headers.get('Location'));
                }).then((res)=>{
                    return res.json();
                }).then((body)=>{
                    localStorage.setItem('rtcEngineSession', body.rtc_browser_token);
                    resolve(localStorage.getItem('rtcEngineSession'));
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        connectRtcEngine(context, options) {
            return new Promise((resolve, reject)=>{

                var force = _.get(options, 'force', false);
                var isConnected = rtcEngineClient instanceof cdk.Client && _.isEmpty(rtcEngineClient.disconnectReason);

                if(isConnected && !force) {
                    resolve();
                } else {
                    Promise.resolve().then(()=>{
                        return context.dispatch('disconnectRtcEngine');
                    }).then(()=>{
                        return context.dispatch('createRtcEngineSession');
                    }).then((sessionToken)=>{
                        rtcEngineClient = new cdk.Client({
                            url: 'wss://' + window.location.host + '/rtc/api',
                            userSession: sessionToken
                        });
                        rtcEngineClient.onConnect(()=>{
                            rtcEngineNetwork = rtcEngineClient.getNetworkByTag('sip');
                            rtcEngineNetwork.onConnect(()=>{
                                context.commit('connectRtcEngine');
                                resolve();
                            });
                            rtcEngineNetwork.onDisconnect(()=>{
                                context.commit('disconnectRtcEngine');
                                reject(new Error('NetworkError: ' + rtcEngineNetwork.disconnectReason));
                            });
                        });
                        rtcEngineClient.onDisconnect(()=>{
                            context.commit('disconnectRtcEngine');
                            reject(new Error('ClientError: ' + rtcEngineClient.disconnectReason));
                        });
                    }).catch((err)=>{
                        context.commit('disconnectRtcEngine');
                        reject(err);
                    });
                }
            });
        },
        disconnectRtcEngine(context) {
            return new Promise((resolve, reject)=>{
                context.commit('disconnectRtcEngine');
                localStorage.removeItem('rtcEngineSession');
                if(rtcEngineClient instanceof cdk.Client && _.isEmpty(rtcEngineClient.disconnectReason)) {
                    rtcEngineClient.onDisconnect(()=>{
                        rtcEngineClient = null;
                        rtcEngineNetwork = null;
                        resolve();
                    });
                    rtcEngineClient.disconnect();
                } else {
                    rtcEngineClient = null;
                    rtcEngineNetwork = null;
                    resolve();
                }
            });
        }
    }
});
