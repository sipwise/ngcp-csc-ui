'use strict';

import Vue from 'vue'
import { i18n } from '../i18n';
import {
    getConversations,
    downloadVoiceMail,
    downloadFax,
    playVoiceMail
} from '../api/conversations'

const ROWS_PER_PAGE = 15;

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
        conversations: [],
        downloadVoiceMailState: RequestState.button,
        downloadVoiceMailError: null,
        downloadFaxState: RequestState.button,
        downloadFaxError: null,
        reloadConversationsState: RequestState.button,
        reloadConversationsError: null,
        playVoiceMailUrls: {},
        playVoiceMailStates: {},
        playVoiceMailErrors: {},
        currentPage: 0,
        lastPage: null,
        nextPageState: RequestState.initiated,
        nextPageError: null,
        items: []
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
        },
        currentPage(state) {
            return state.currentPage;
        },
        lastPage(state) {
            return state.lastPage;
        },
        rowsAlreadyLoaded(state) {
            return state.items.length;
        },
        items(state) {
            return state.items;
        },
        isNextPageRequesting(state) {
            return state.nextPageState === RequestState.requesting;
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
        },
        resetList(state) {
            state.items = [];
            state.currentPage = 0;
            state.lastPage = null;
        },
        nextPageRequesting(state) {
            state.nextPageState = RequestState.requesting;
            state.nextPageError = null;
        },
        nextPageSucceeded(state, items) {
            state.nextPageState = RequestState.succeeded;
            state.nextPageError = null;
            state.items = state.items.concat(items.items);
            state.lastPage = items.lastPage;
            state.currentPage = state.currentPage + 1;

            let callId = null;
            let callIndex = null;
            state.items.forEach((item, index)=>{
                if(item.type === 'call' && item.call_type === 'call') {
                    callId = item.call_id;
                    callIndex = index;
                }
                else if (item.type === 'call' && item.call_id === callId) {
                    let temp = state.items[callIndex];
                    item.relatedCall = temp;
                    state.items[callIndex] = item;
                    state.items[index] = temp;
                    callIndex = index;

                }
            });
        },
        nextPageFailed(state, error) {
            state.nextPageState = RequestState.failed;
            state.nextPageError = error;
        }
    },
    actions: {

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
        },
        nextPage(context) {
            let page = context.getters.currentPage + 1;
            if(context.getters.lastPage === null || page <= context.getters.lastPage) {
                context.commit('nextPageRequesting');
                getConversations(
                    context.getters.getSubscriberId,
                    page,
                    ROWS_PER_PAGE
                ).then((result) => {
                    context.commit('nextPageSucceeded', result);
                }).catch((err)=>{
                    context.commit('nextPageFailed', err.message);
                });
            }
        }
    }
};
