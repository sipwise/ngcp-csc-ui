'use strict';

import { getConversations, downloadVoiceMail, downloadFax } from '../api/conversations'

const RequestState = {
    button: 'button',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

export default {
    namespaced: true,
    state: {
        page: 1,
        rows: 10,
        conversations: [
        ],
        downloadVoiceMailState: RequestState.button,
        downloadVoiceMailError: null,
        downloadFaxState: RequestState.button,
        downloadFaxError: null
    },
    mutations: {
        loadConversations(state, options) {
            state.conversations = state.conversations.concat(options);
            state.page++;
        },
        downloadVoiceMailRequesting(state) {
            state.downloadVoiceMailState = RequestState.requesting;
            state.downloadVoiceMailError = null;
        },
        downloadVoiceMailSucceeded(state) {
            state.downloadVoiceMailState = RequestState.succeeded;
            state.downloadVoiceMailError = null;
        },
        downloadVoiceMailFailed(state, error) {
            state.downloadVoiceMailState = RequestState.failed;
            state.downloadVoiceMailError = error;
        },
        downloadFaxRequesting(state) {
            state.downloadFaxState = RequestState.requesting;
            state.downloadFaxError = null;
        },
        downloadFaxSucceeded(state) {
            state.downloadFaxState = RequestState.succeeded;
            state.downloadFaxError = null;
        },
        downloadFaxFailed(state, error) {
            state.downloadFaxState = RequestState.failed;
            state.downloadFaxError = error;
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
            context.commit('downloadVoiceMailRequesting');
            return new Promise((resolve, reject)=>{
                downloadVoiceMail(id).then(()=>{
                    resolve();
                    context.commit('downloadVoiceMailSucceeded');
                }).catch((err)=>{
                    reject(err);
                    console.log(err.body.message);
                    context.commit('downloadVoiceMailFailed', err.body.message);
                });
            });
        },
        downloadFax(context, id) {
            context.commit('downloadFaxRequesting');
            return new Promise((resolve, reject)=>{
                downloadFax(id).then(()=>{
                    resolve();
                    context.commit('downloadFaxSucceeded');
                }).catch((err)=>{
                    reject(err);
                    console.log(err);
                    context.commit('downloadFaxFailed', err.body.message);
                });
            });
        }
    }
};
