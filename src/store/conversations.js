
'use strict';

import { getConversations,
} from '../api/conversations';

export default {
    namespaced: true,
    state: {
        conversationsList: []
    },
    mutations: {
        loadConversations(state, options) {
            let list = [];
            // TODO Create an array consisting of objects, where each object is
            // a conversations item. First delete occurances of _link, then loop
            // pushing items into said array
            state.conversationsList = options._embedded['ngcp:conversations'];
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
