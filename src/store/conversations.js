
'use strict'

import _ from 'lodash'
import crypto from 'crypto-browserify'
import { getConversations } from '../api/conversations'

export default {
    namespaced: true,
    state: {
        page: 1,
        rows: 10,
        conversations: [
        ],
        voicemailPlaying: false,
        progressPercentage: 0
    },
    mutations: {
        loadConversations(state, options) {
            let list = [];
            _.forEach(options, function(item) {
                let inputString = `${item.type}${item.call_type}${item.id}`;
                let id = crypto.createHash('sha256').update(inputString).digest('base64');
                item._id = id;
                item.voicemail = item._links['ngcp:voicemailrecordings'].href;
                delete item._links;
                if (item.type == 'call') {
                    item.type = item.call_type != 'call' ? 'callforward'
                        : item.type;
                };
                list.push(item);
            })
            state.conversations = state.conversations.concat(list);
            state.page++;
        },
        setVoicemailPlaying(state) {
            state.voicemailPlaying = true;
        },
        setVoicemailStopped(state) {
            state.voicemailPlaying = false;
        },
        setProgressPercentage(state, percentage) {
            state.progressPercentage = percentage;
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
        setVoicemailPlaying(context) {
            context.commit('setVoicemailPlaying');
        },
        setVoicemailStopped(context) {
            context.commit('setVoicemailStopped');
        },
        setProgressPercentage(context, percentage) {
            context.commit('setProgressPercentage', percentage);
        }
    }
};
