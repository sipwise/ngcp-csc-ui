'use strict';

import { getConversations, downloadVoiceMail } from '../api/conversations'

export default {
    namespaced: true,
    state: {
        page: 1,
        rows: 10,
        conversations: [
        ]
    },
    mutations: {
        loadConversations(state, options) {
            state.conversations = state.conversations.concat(options);
            state.page++;
        }
    },
    actions: {
        loadConversations(context) {
            return new Promise((resolve, reject) => {
                getConversations(localStorage.getItem('subscriberId'), context.state.page, context.state.rows)
                    .then(result => {
                        context.commit('loadConversations', result);
                        resolve();
                    })
                .catch((err)=>{
                    reject(err);
                });
            });
        },
        downloadVoiceMail(context, id) {
            return new Promise((resolve, reject)=>{
                downloadVoiceMail(id).then(()=>{
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        }
    }
};
