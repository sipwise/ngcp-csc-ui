'use strict';

import Vue from 'vue';
import _ from 'lodash';
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

const ReloadConfig = {
    retryLimit: 5,
    retryDelay: 5000
};

function linkCallsWithSameId(state) {
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
}

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
        reloadItemsState: RequestState.button,
        reloadItemsError: null,
        playVoiceMailUrls: {},
        playVoiceMailStates: {},
        playVoiceMailErrors: {},
        currentPage: 0,
        lastPage: null,
        nextPageState: RequestState.initiated,
        nextPageError: null,
        items: [],
        itemsReloaded: false
    },
    getters: {
        getSubscriberId(state, getters, rootState, rootGetters) {
            return rootGetters['user/getSubscriberId'];
        },
        reloadItemsState(state) {
            return state.reloadItemsState;
        },
        reloadItemsError(state) {
            return state.reloadItemsError ||
                i18n.t('pages.conversations.reloadItemsErrorMessage');
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
        },
        downloadFaxState(state) {
            return state.downloadFaxState;
        },
        downloadVoiceMailState(state) {
            return state.downloadVoiceMailState;
        },
        downloadFaxError(state) {
            return state.downloadFaxError;
        },
        downloadVoiceMailError(state) {
            return state.downloadVoiceMailError;
        },
        itemsReloaded(state) {
            return state.itemsReloaded;
        }
    },
    mutations: {
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
        reloadItemsRequesting(state) {
            state.reloadItemsState = RequestState.requesting;
            state.reloadItemsError = null;
            state.itemsReloaded = false;
        },
        reloadItemsSucceeded(state, items) {
            state.reloadItemsState = RequestState.succeeded;
            state.reloadItemsError = null;
            state.items = items.items;
            linkCallsWithSameId(state);
            state.itemsReloaded = true;
        },
        reloadItemsFailed(state, error) {
            state.reloadItemsState = RequestState.failed;
            state.reloadItemsError = error;
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
            linkCallsWithSameId(state);
        },
        nextPageFailed(state, error) {
            state.nextPageState = RequestState.failed;
            state.nextPageError = error;
        }
    },
    actions: {
        reloadItems(context, options) {
            context.commit('reloadItemsRequesting');
            let rows = context.state.currentPage * ROWS_PER_PAGE;
            let firstStateItemTimestamp = context.state.items[0] ?
                context.state.items[0].start_time : null;
            if (options.retryCount < ReloadConfig.retryLimit) {
                getConversations({
                    subscriberId: context.getters.getSubscriberId,
                    page: 1,
                    rows: rows,
                    type: options.type
                }).then((result) => {
                    let firstResultItemTimestamp = result.items[0] ?
                        result.items[0].start_time : null;
                    if (_.isEqual(firstStateItemTimestamp, firstResultItemTimestamp)) {
                        setTimeout(() => {
                            context.dispatch('reloadItems', {
                                retryCount: ++options.retryCount,
                                type: options.type
                            });
                        }, ReloadConfig.retryDelay);
                    }
                    else {
                        context.commit('reloadItemsSucceeded', result);
                    }
                }).catch((err) => {
                    context.commit('reloadItemsFailed', err.message);
                });
            }
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
        },
        nextPage(context, type) {
            let page = context.getters.currentPage + 1;
            if(context.getters.lastPage === null || page <= context.getters.lastPage) {
                context.commit('nextPageRequesting');
                getConversations({
                    subscriberId: context.getters.getSubscriberId,
                    page: page,
                    rows: ROWS_PER_PAGE,
                    type: type
                }).then((result) => {
                    context.commit('nextPageSucceeded', result);
                }).catch((err)=>{
                    context.commit('nextPageFailed', err.message);
                });
            }
        }
    }
};
