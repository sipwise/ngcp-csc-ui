
'use strict';

import { getConversations,
} from '../api/conversations';

export default {
    namespaced: true,
    // TODO Fields to include in state, most of which presumably will be stored
    // in conversationsList only, as there will be multiple instances of
    // conversation items:
    // call_type, callee, caller, direction, duration, id, start_time, status,
    // type plus call_id, filename and folder (the latter 3 missing currently)
    state: {
        conversationsList: []
    },
    mutations: {
        loadConversations(state, options) {
            let list = [];
            options._embedded['ngcp:conversations'].forEach(function(item) {
                // TODO Investigate lodash alternative to forEach, of any
                delete item._links;
                list.push(item);
            })
            state.conversationsList = list;
        }
    },
    actions: {
        loadConversations(context) {
            return new Promise((resolve, reject)=>{
                getConversations(localStorage.getItem('subscriberId'))
                    .then((result)=>{
                        context.commit('loadConversations', result);
                        resolve();
                    })
                .catch((err)=>{
                    reject(err);
                });
            });
        }
    }
};
