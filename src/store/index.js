'use strict';

import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import CallBlockingModule from './call-blocking'
import CallForwardModule from './call-forward'
import CallModule from './call'
import ConversationsModule from './conversations'
import PbxConfigModule from './pbx-config/index'
import ReminderModule from './reminder'
import SpeedDialModule from './speed-dial'
import UserModule from './user'
import CommunicationModule from './communication'
import VoiceboxModule from './voicebox'

import {
    i18n
} from '../i18n';

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
        voicebox: VoiceboxModule
    },
    getters: {
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
    }
});
