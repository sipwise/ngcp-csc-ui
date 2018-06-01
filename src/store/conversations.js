'use strict';

import Vue from 'vue'
import _ from 'lodash';
import { i18n } from '../i18n';
import {
    getConversations,
    downloadVoiceMail,
    downloadFax,
    playVoiceMail
} from '../api/conversations'

const RequestState = {
    button: 'button',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

const ReloadConfig = {
    retryLimit: 5,
    retryDelay: 5000
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
        downloadFaxError: null,
        reloadConversationsState: RequestState.button,
        reloadConversationsError: null,
        playVoiceMailUrls: {},
        playVoiceMailStates: {},
        playVoiceMailErrors: {}
    },
    getters: {
        getSubscriberId(state, getters, rootState, rootGetters) {
            return rootGetters['user/getSubscriberId'];
        },
        reloadConversationsState(state) {
            return state.reloadConversationsState;
        },
        reloadConversationsError(state) {
            return state.reloadConversationsError ||
                i18n.t('pages.conversations.reloadConversationsErrorMessage');
        },
        playVoiceMailState(state) {
            return (id) => {
                return state.playVoiceMailStates[id];
            }
        },
        playVoiceMailUrl(state) {
            return (id) => {
                return state.playVoiceMailUrls[id];
            }
        }
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
        },
        reloadConversationsRequesting(state) {
            state.reloadConversationsState = RequestState.requesting;
            state.reloadConversationsError = null;
        },
        reloadConversationsSucceeded(state) {
            state.reloadConversationsState = RequestState.succeeded;
            state.reloadConversationsError = null;
        },
        reloadConversationsFailed(state, error) {
            state.reloadConversationsState = RequestState.failed;
            state.reloadConversationsError = error;
        },
        resetConversations(state) {
            state.page = 1;
        },
        reloadConversations(state, result) {
            state.conversations = result;
            state.page++;
        },
        playVoiceMailRequesting(state, id) {
            Vue.set(state.playVoiceMailStates, id, RequestState.requesting);
            Vue.set(state.playVoiceMailErrors, id, null);
        },
        playVoiceMailSucceeded(state, options) {
            Vue.set(state.playVoiceMailUrls, options.id, options.url);
            Vue.set(state.playVoiceMailStates, options.id, RequestState.succeeded);
            Vue.set(state.playVoiceMailErrors, options.id, null);
        },
        playVoiceMailFailed(state, id, err) {
            Vue.set(state.playVoiceMailUrls, id, null);
            Vue.set(state.playVoiceMailStates, id, RequestState.failed);
            Vue.set(state.playVoiceMailErrors, id, err);
        }
    },
    actions: {
        reloadConversations(context, retryCount) {
            context.commit('resetConversations');
            let firstItem = context.state.conversations[0];
            if (retryCount < ReloadConfig.retryLimit) {
                getConversations({
                    id: context.getters.getSubscriberId,
                    page: context.state.page,
                    rows: context.state.rows
                }).then((result) => {
                    if (_.isEqual(firstItem, result[0])) {
                        setTimeout(() => {
                            context.dispatch('reloadConversations', ++retryCount);
                        }, ReloadConfig.retryDelay);
                    }
                    else {
                        context.commit('reloadConversations', result);
                        context.commit('reloadConversationsSucceeded');
                    }
                }).catch(() => {
                    context.commit('reloadConversationsFailed');
                });
            }
        },
        loadConversations(context) {
            return new Promise((resolve, reject) => {
                getConversations({
                    id: context.getters.getSubscriberId,
                    page: context.state.page,
                    rows: context.state.rows
                }).then((result) => {
                    context.commit('loadConversations', result);
                    resolve();
                }).catch((err)=>{
                    reject(err);
                });
            });
        },
        downloadVoiceMail(context, id) {
            context.commit('downloadVoiceMailRequesting');
            downloadVoiceMail(id).then(()=>{
                context.commit('downloadVoiceMailSucceeded');
            }).catch((err)=>{
                context.commit('downloadVoiceMailFailed', err.body.message);
            });
        },
        downloadFax(context, id) {
            context.commit('downloadFaxRequesting');
            downloadFax(id).then(()=>{
                context.commit('downloadFaxSucceeded');
            }).catch((err)=>{
                context.commit('downloadFaxFailed', err.body.message);
            });
        },
        playVoiceMail(context, options) {
            context.commit('playVoiceMailRequesting', options.id);
            playVoiceMail(options).then((url)=>{
                context.commit('playVoiceMailSucceeded', {
                    id: options.id,
                    url: url
                });
            }).catch((err)=>{
                context.commit('playVoiceMailFailed', options.id, err.mesage);
            });
        }
    }
};
