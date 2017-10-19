'use strict';

import Vue from 'vue'
import Vuex from 'vuex'

import UserModule from './user'
import PbxGroupsModule from './pbx-groups'
import CallBlockingModule from './call-blocking'
import ReminderModule from './reminder'
import CallModule from './call'

Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        user: UserModule,
        pbxGroups: PbxGroupsModule,
        callBlocking: CallBlockingModule,
        reminder: ReminderModule,
        call: CallModule
    }
});
