
'use strict';

import _ from 'lodash';
import { getConversations } from '../api/conversations';

export default {
    namespaced: true,
    state: {
        conversations: [
        ]
    },
    mutations: {
        loadConversations(state, options) {
            let list = [];
            _.forEach(options, function(item) {
                delete item._links;
                if (item.type == 'call') {
                    item.type = item.call_type != 'call' ? 'call forward'
                        : item.type;
                };
                list.push(item);
            })
            state.conversations = list;
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
