'use strict';

import Vue from 'vue'
import Vuex from 'vuex'
import CallBlockingModule from './call-blocking'
import CallForwardModule from './call-forward'
import CallModule from './call'
import ConversationsModule from './conversations'
import LayoutModule from './layout'
import PbxConfigModule from './pbx-config'
import ReminderModule from './reminder'
import UserModule from './user'

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        callBlocking: CallBlockingModule,
        callForward: CallForwardModule,
        call: CallModule,
        conversations: ConversationsModule,
        layout: LayoutModule,
        pbxConfig: PbxConfigModule,
        reminder: ReminderModule,
        user: UserModule
    }
});
