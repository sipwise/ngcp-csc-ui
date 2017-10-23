
'use strict';

import { getConversations } from '../api/conversations';

export default {
    namespaced: true,
    // TODO Fields to include in state, most of which presumably will be stored
    // in conversationsList only, as there will be multiple instances of
    // conversation items:
    // call_type, callee, caller, direction, duration, id, start_time, status,
    // type plus call_id, filename and folder (the latter 3 missing currently)
    state: {
        conversationsList: [
            {
               "call_type": "cfu",
               "callee": "vmu43993007@voicebox.local",
               "caller": "43112233",
               "direction": "in",
               "duration": "0:00:00.000",
               "id": 19,
               "rating_status": "ok",
               "start_time": "2017-10-27 09:14:07.290",
               "status": "ok",
               "type": "cfu"
            }, {
               "call_type": "voicemail",
               "callee": "vmu43993007@voicebox.local",
               "caller": "43993007",
               "direction": "out",
               "duration": "0:00:06.854",
               "id": 19,
               "rating_status": "ok",
               "start_time": "2017-10-27 09:03:07.190",
               "status": "ok",
               "type": "cfu"
            }, {
               "call_type": "call",
               "callee": "43993006",
               "caller": "43993007",
               "direction": "out",
               "duration": "0:00:12.894",
               "id": 21,
               "rating_status": "ok",
               "start_time": "2017-10-26 13:14:17.229",
               "status": "FAILED",
               "type": "call"
            }
        ]
    },
    mutations: {
        loadConversations(state, options) {
            //let list = [];
            //options._embedded['ngcp:conversations'].forEach(function(item) {
                //// TODO Investigate lodash alternative to forEach, of any
                //delete item._links;
                //list.push(item);
            //})
            //state.conversationsList = list;
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
