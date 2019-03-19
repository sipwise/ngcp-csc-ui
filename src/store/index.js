'use strict';

import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import CallBlockingModule from './call-blocking'
import CallForwardModule from './call-forward'
import CallModule, {errorVisibilityTimeout} from './call'
import ConversationsModule from './conversations'
import PbxConfigModule from './pbx-config/index'
import ReminderModule from './reminder'
import SpeedDialModule from './speed-dial'
import UserModule from './user'
import CommunicationModule from './communication'
import VoiceboxModule from './voicebox'
import ConferenceModule from './conference'
import {
    i18n
} from '../i18n';
import RtcEnginePlugin from "../plugins/rtc-engine";
import CallPlugin from "../plugins/call";
import ConferencePlugin from "../plugins/conference";

Vue.use(RtcEnginePlugin);
Vue.use(CallPlugin);
Vue.use(ConferencePlugin);
Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        callBlocking: CallBlockingModule,
        callForward: CallForwardModule,
        call: CallModule,
        conversations: ConversationsModule,
        pbxConfig: PbxConfigModule,
        reminder: ReminderModule,
        speedDial: SpeedDialModule,
        user: UserModule,
        communication: CommunicationModule,
        voicebox: VoiceboxModule,
        conference: ConferenceModule
    },
    getters: {
        conferenceId(state) {
            return _.get(state, 'route.params.id', null);
        },
        pageTitle(state) {
            return _.get(state, 'route.meta.title', 'Not defined');
        },
        pageSubtitle(state) {
            return _.get(state, 'route.meta.subtitle', '');
        },
        isCallForward(state) {
            return _.startsWith(_.get(state, 'route.path', ''), '/user/call-forward');
        },
        isCallBlocking(state) {
            return _.startsWith(_.get(state, 'route.path', ''), '/user/call-blocking');
        },
        isPbxConfiguration(state) {
            return _.startsWith(_.get(state, 'route.path', ''), '/user/pbx-configuration');
        },
        isHome(state) {
            return _.get(state, 'route.path', '') === '/user/home';
        },
        title() {
            return i18n.t('title');
        }
    },
    plugins: [
        function rtcEngine(store) {
            Vue.$rtcEngine.onSipNetworkConnected(()=>{
                store.commit('call/enableCall');
            }).onSipNetworkDisconnected(()=>{
                store.commit('call/disableCall');
            }).onConferenceNetworkConnected(() => {
                store.commit('conference/enableConferencing');
            }).onConferenceNetworkDisconnected(() => {
                store.commit('conference/disableConferencing');
            });
            Vue.$call.onIncoming(()=>{
                store.commit('incomingCall', {
                    number: Vue.call.getNumber()
                });
            }).onRemoteMedia((remoteMediaStream)=>{
                store.commit('establishCall', remoteMediaStream);
            }).onEnded((reason)=>{
                Vue.$call.end();
                store.commit('endCall', reason);
                setTimeout(()=>{
                    store.commit('inputNumber');
                }, errorVisibilityTimeout);
            });
        }
    ]
});
